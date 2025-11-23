import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface EnergyLog {
    id: string;
    userId: string;
    level: number; // 1-10
    timestamp: any;
    notes?: string;
}

export const logEnergy = async (userId: string, level: number, notes?: string) => {
    try {
        // Use nested collection: users/{userId}/energy_logs
        const energyLogsRef = collection(db, 'users', userId, 'energy_logs');
        await addDoc(energyLogsRef, {
            level,
            timestamp: serverTimestamp(),
            notes: notes || '',
        });
    } catch (error) {
        console.error("Error logging energy: ", error);
        throw error;
    }
};

export const getLatestEnergyLog = async (userId: string): Promise<EnergyLog | null> => {
    // Use nested collection: users/{userId}/energy_logs
    const energyLogsRef = collection(db, 'users', userId, 'energy_logs');
    const q = query(
        energyLogsRef,
        orderBy("timestamp", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, userId, ...doc.data() } as EnergyLog;
};

export const getRecentEnergyLogs = async (userId: string, limitCount: number = 5): Promise<EnergyLog[]> => {
    // Use nested collection: users/{userId}/energy_logs
    const energyLogsRef = collection(db, 'users', userId, 'energy_logs');
    const q = query(
        energyLogsRef,
        orderBy("timestamp", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, userId, ...doc.data() } as EnergyLog));
};

