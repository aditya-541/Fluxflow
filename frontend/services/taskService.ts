import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp,
    getDocs,
    writeBatch,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type TaskCategory = 'deep-work' | 'admin' | 'creative' | 'physical' | 'personal';

export interface RecurrencePattern {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number; // Every N days/weeks/months
    daysOfWeek?: number[]; // For weekly (0=Sun, 6=Sat)
    dayOfMonth?: number; // For monthly (1-31)
    endDate?: string; // ISO date string
    skipWeekends?: boolean;
}

export interface Task {
    id: string;
    title: string;
    userId: string;
    completed: boolean;
    createdAt: any;
    priority: number; // 1 (Low) - 3 (High)
    estimatedDuration: number; // minutes
    category?: TaskCategory;
    parentTaskId?: string; // ID of parent task (for subtasks)
    dependsOn?: string[]; // Array of task IDs this task depends on
    subtaskIds?: string[]; // Array of subtask IDs
    completedSubtasks?: number; // Count of completed subtasks
    totalSubtasks?: number; // Total number of subtasks
    // Recurring task fields
    isRecurring?: boolean; // Is this a recurring task template?
    recurringTemplateId?: string; // Link to template (for instances)
    recurrencePattern?: RecurrencePattern;
    nextOccurrence?: string; // ISO date string
    currentStreak?: number; // Consecutive completions
    longestStreak?: number; // Best streak ever
    lastCompletedDate?: string; // ISO date string
}


export const addTask = async (
    userId: string,
    title: string,
    duration: number,
    priority: number,
    category?: TaskCategory,
    parentTaskId?: string,
    dependsOn?: string[]
) => {
    try {
        const tasksRef = collection(db, 'users', userId, 'tasks');
        const newTask = {
            title,
            completed: false,
            createdAt: serverTimestamp(),
            priority,
            estimatedDuration: duration,
            category: category || 'personal',
            ...(parentTaskId && { parentTaskId }),
            ...(dependsOn && dependsOn.length > 0 && { dependsOn }),
            ...(parentTaskId && { subtaskIds: [], completedSubtasks: 0, totalSubtasks: 0 })
        };

        const docRef = await addDoc(tasksRef, newTask);

        // If this is a subtask, update parent's subtask count
        if (parentTaskId) {
            await updateParentSubtaskCount(userId, parentTaskId, 1);
        }

        return docRef.id;
    } catch (error) {
        console.error("Error adding task: ", error);
        throw error;
    }
};

export const addSubtask = async (
    userId: string,
    parentTaskId: string,
    title: string,
    duration: number,
    category?: TaskCategory
) => {
    return addTask(userId, title, duration, 1, category, parentTaskId);
};

const updateParentSubtaskCount = async (userId: string, parentTaskId: string, delta: number) => {
    const parentRef = doc(db, 'users', userId, 'tasks', parentTaskId);
    const parentDoc = await getDoc(parentRef);

    if (parentDoc.exists()) {
        const currentTotal = parentDoc.data().totalSubtasks || 0;
        await updateDoc(parentRef, {
            totalSubtasks: currentTotal + delta
        });
    }
};

export const updateParentProgress = async (userId: string, parentTaskId: string) => {
    const subtasks = await getSubtasks(userId, parentTaskId);
    const completedCount = subtasks.filter(t => t.completed).length;

    const parentRef = doc(db, 'users', userId, 'tasks', parentTaskId);
    await updateDoc(parentRef, {
        completedSubtasks: completedCount,
        totalSubtasks: subtasks.length
    });
};

export const getSubtasks = async (userId: string, parentTaskId: string): Promise<Task[]> => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, where('parentTaskId', '==', parentTaskId), orderBy('createdAt', 'asc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        userId,
        ...doc.data()
    } as Task));
};

export const canCompleteTask = async (userId: string, taskId: string): Promise<boolean> => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) return false;

    const task = taskDoc.data() as Task;

    // Check if dependencies are met
    if (task.dependsOn && task.dependsOn.length > 0) {
        const tasksRef = collection(db, 'users', userId, 'tasks');
        const snapshot = await getDocs(tasksRef);
        const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

        const dependenciesMet = task.dependsOn.every(depId => {
            const depTask = allTasks.find(t => t.id === depId);
            return depTask?.completed === true;
        });

        if (!dependenciesMet) return false;
    }

    return true;
};

export const toggleTaskCompletion = async (userId: string, taskId: string, currentStatus: boolean) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) return;

    const task = taskDoc.data() as Task;

    // If trying to complete, check dependencies
    if (!currentStatus) {
        const canComplete = await canCompleteTask(userId, taskId);
        if (!canComplete) {
            throw new Error('Cannot complete task: dependencies not met');
        }
    }

    await updateDoc(taskRef, {
        completed: !currentStatus
    });

    // Update parent progress if this is a subtask
    if (task.parentTaskId) {
        await updateParentProgress(userId, task.parentTaskId);
    }

    // Update streak if this is a recurring task instance
    if (task.recurringTemplateId && !currentStatus) {
        const { updateStreak } = await import('./recurringTaskService');
        await updateStreak(userId, task.recurringTemplateId, true);
    }
};

export const deleteTask = async (userId: string, taskId: string) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);

    if (!taskDoc.exists()) return;

    const task = taskDoc.data() as Task;

    // Delete all subtasks if this is a parent task
    if (task.totalSubtasks && task.totalSubtasks > 0) {
        const subtasks = await getSubtasks(userId, taskId);
        const batch = writeBatch(db);

        subtasks.forEach(subtask => {
            const subtaskRef = doc(db, 'users', userId, 'tasks', subtask.id);
            batch.delete(subtaskRef);
        });

        await batch.commit();
    }

    // Update parent if this is a subtask
    if (task.parentTaskId) {
        await updateParentSubtaskCount(userId, task.parentTaskId, -1);
        await updateParentProgress(userId, task.parentTaskId);
    }

    await deleteDoc(taskRef);
};

export const subscribeToTasks = (userId: string, onUpdate: (tasks: Task[]) => void) => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            userId,
            ...doc.data()
        } as Task));
        onUpdate(tasks);
    });
};
