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
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export type TaskCategory = 'deep-work' | 'admin' | 'creative' | 'physical' | 'personal';

export interface Task {
    id: string;
    title: string;
    userId: string;
    completed: boolean;
    createdAt: any;
    priority: number; // 1 (Low) - 3 (High)
    estimatedDuration: number; // minutes
    category?: TaskCategory;
}

export const addTask = async (
    userId: string,
    title: string,
    duration: number,
    priority: number,
    category?: TaskCategory
) => {
    try {
        // Use nested collection: users/{userId}/tasks
        const tasksRef = collection(db, 'users', userId, 'tasks');
        await addDoc(tasksRef, {
            title,
            completed: false,
            createdAt: serverTimestamp(),
            priority,
            estimatedDuration: duration,
            category: category || 'personal',
        });
    } catch (error) {
        console.error("Error adding task: ", error);
        throw error;
    }
};

export const toggleTaskCompletion = async (userId: string, taskId: string, currentStatus: boolean) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
        completed: !currentStatus
    });
};

export const deleteTask = async (userId: string, taskId: string) => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
};

export const subscribeToTasks = (userId: string, onUpdate: (tasks: Task[]) => void) => {
    // Use nested collection: users/{userId}/tasks
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

