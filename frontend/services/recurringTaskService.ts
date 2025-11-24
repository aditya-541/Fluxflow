import { Task, RecurrencePattern } from './taskService';
import { addTask } from './taskService';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Calculate the next occurrence date based on recurrence pattern
 */
export const calculateNextDate = (pattern: RecurrencePattern, fromDate: Date = new Date()): Date => {
    const next = new Date(fromDate);

    switch (pattern.frequency) {
        case 'daily':
            next.setDate(next.getDate() + pattern.interval);

            // Skip weekends if enabled
            if (pattern.skipWeekends) {
                while (next.getDay() === 0 || next.getDay() === 6) {
                    next.setDate(next.getDate() + 1);
                }
            }
            break;

        case 'weekly':
            // Add weeks
            next.setDate(next.getDate() + (pattern.interval * 7));

            // If specific days are set, find next matching day
            if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
                const currentDay = next.getDay();
                const sortedDays = [...pattern.daysOfWeek].sort((a, b) => a - b);

                // Find next day in the list
                let nextDay = sortedDays.find(d => d > currentDay);
                if (!nextDay) {
                    // Wrap to next week
                    nextDay = sortedDays[0];
                    next.setDate(next.getDate() + (7 - currentDay + nextDay));
                } else {
                    next.setDate(next.getDate() + (nextDay - currentDay));
                }
            }
            break;

        case 'monthly':
            next.setMonth(next.getMonth() + pattern.interval);

            // Handle day of month
            if (pattern.dayOfMonth) {
                const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
                next.setDate(Math.min(pattern.dayOfMonth, lastDay));
            }
            break;
    }

    return next;
};

/**
 * Create a recurring task template
 */
export const createRecurringTask = async (
    userId: string,
    title: string,
    duration: number,
    priority: number,
    category: string,
    pattern: RecurrencePattern
): Promise<string> => {
    const nextOccurrence = calculateNextDate(pattern);

    const taskId = await addTask(
        userId,
        title,
        duration,
        priority,
        category as any,
        undefined, // parentTaskId
        undefined  // dependsOn
    );

    // Update with recurring fields
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
        isRecurring: true,
        recurrencePattern: pattern,
        nextOccurrence: nextOccurrence.toISOString(),
        currentStreak: 0,
        longestStreak: 0
    });

    return taskId;
};

/**
 * Generate next occurrence instance from template
 */
export const generateNextOccurrence = async (
    userId: string,
    templateId: string,
    template: Task
): Promise<string | null> => {
    if (!template.recurrencePattern || !template.nextOccurrence) return null;

    const nextDate = new Date(template.nextOccurrence);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only generate if next occurrence is today or in the past
    if (nextDate > today) return null;

    // Check if end date has passed
    if (template.recurrencePattern.endDate) {
        const endDate = new Date(template.recurrencePattern.endDate);
        if (nextDate > endDate) return null;
    }

    // Create instance
    const instanceId = await addTask(
        userId,
        template.title,
        template.estimatedDuration,
        template.priority,
        template.category,
        undefined,
        undefined
    );

    // Link to template
    const instanceRef = doc(db, 'users', userId, 'tasks', instanceId);
    await updateDoc(instanceRef, {
        recurringTemplateId: templateId,
        createdAt: serverTimestamp()
    });

    // Update template's next occurrence
    const newNextOccurrence = calculateNextDate(template.recurrencePattern, nextDate);
    const templateRef = doc(db, 'users', userId, 'tasks', templateId);
    await updateDoc(templateRef, {
        nextOccurrence: newNextOccurrence.toISOString()
    });

    return instanceId;
};

/**
 * Generate instances for all recurring tasks that need them
 */
export const generateRecurringInstances = async (userId: string): Promise<void> => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, where('isRecurring', '==', true));

    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Task));

    for (const template of templates) {
        // Generate up to 7 days ahead
        let generated = 0;
        while (generated < 7) {
            const instanceId = await generateNextOccurrence(userId, template.id, template);
            if (!instanceId) break;
            generated++;

            // Refresh template data
            const updatedDoc = await getDocs(query(tasksRef, where('__name__', '==', template.id)));
            if (updatedDoc.docs.length > 0) {
                Object.assign(template, updatedDoc.docs[0].data());
            }
        }
    }
};

/**
 * Update streak when completing a recurring task instance
 */
export const updateStreak = async (
    userId: string,
    templateId: string,
    completed: boolean
): Promise<void> => {
    const templateRef = doc(db, 'users', userId, 'tasks', templateId);
    const templateDoc = await getDocs(query(collection(db, 'users', userId, 'tasks'), where('__name__', '==', templateId)));

    if (templateDoc.docs.length === 0) return;

    const template = templateDoc.docs[0].data() as Task;

    if (!completed) {
        // Reset streak
        await updateDoc(templateRef, {
            currentStreak: 0
        });
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const lastCompleted = template.lastCompletedDate
        ? new Date(template.lastCompletedDate)
        : null;

    if (!lastCompleted) {
        // First completion
        await updateDoc(templateRef, {
            currentStreak: 1,
            longestStreak: 1,
            lastCompletedDate: todayISO
        });
        return;
    }

    lastCompleted.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
        // Consecutive day
        const newStreak = (template.currentStreak || 0) + 1;
        await updateDoc(templateRef, {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, template.longestStreak || 0),
            lastCompletedDate: todayISO
        });
    } else if (daysDiff > 1) {
        // Streak broken
        await updateDoc(templateRef, {
            currentStreak: 1,
            longestStreak: Math.max(1, template.longestStreak || 0),
            lastCompletedDate: todayISO
        });
    }
    // If daysDiff === 0, same day completion, don't update
};

/**
 * Get all recurring task templates
 */
export const getRecurringTasks = async (userId: string): Promise<Task[]> => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, where('isRecurring', '==', true));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        userId,
        ...doc.data()
    } as Task));
};
