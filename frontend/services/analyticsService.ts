import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { EnergyLog } from './energyService';
import { Task, TaskCategory } from './taskService';

export interface DailyEnergyData {
    date: string;
    averageEnergy: number;
    count: number;
}

export interface DailyTaskData {
    date: string;
    completed: number;
    total: number;
}

export interface CategoryData {
    category: TaskCategory;
    count: number;
    percentage: number;
}

export interface HourlyProductivity {
    hour: number;
    averageEnergy: number;
    count: number;
}

/**
 * Get energy logs within a date range
 */
export const getEnergyLogsInRange = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<EnergyLog[]> => {
    const energyLogsRef = collection(db, 'users', userId, 'energy_logs');
    const q = query(
        energyLogsRef,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, userId, ...doc.data() } as EnergyLog));
};

/**
 * Get tasks within a date range
 */
export const getTasksInRange = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<Task[]> => {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(
        tasksRef,
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, userId, ...doc.data() } as Task));
};

/**
 * Aggregate energy logs by day
 */
export const aggregateEnergyByDay = (energyLogs: EnergyLog[]): DailyEnergyData[] => {
    const dailyMap = new Map<string, { total: number; count: number }>();

    energyLogs.forEach(log => {
        const date = log.timestamp?.toDate?.() || new Date(log.timestamp);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        const existing = dailyMap.get(dateKey) || { total: 0, count: 0 };
        dailyMap.set(dateKey, {
            total: existing.total + log.level,
            count: existing.count + 1
        });
    });

    return Array.from(dailyMap.entries())
        .map(([date, data]) => ({
            date,
            averageEnergy: data.total / data.count,
            count: data.count
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Aggregate tasks by day
 */
export const aggregateTasksByDay = (tasks: Task[]): DailyTaskData[] => {
    const dailyMap = new Map<string, { completed: number; total: number }>();

    tasks.forEach(task => {
        const date = task.createdAt?.toDate?.() || new Date(task.createdAt);
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

        const existing = dailyMap.get(dateKey) || { completed: 0, total: 0 };
        dailyMap.set(dateKey, {
            completed: existing.completed + (task.completed ? 1 : 0),
            total: existing.total + 1
        });
    });

    return Array.from(dailyMap.entries())
        .map(([date, data]) => ({
            date,
            completed: data.completed,
            total: data.total
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Aggregate tasks by category
 */
export const aggregateTasksByCategory = (tasks: Task[]): CategoryData[] => {
    const categoryMap = new Map<TaskCategory, number>();

    tasks.forEach(task => {
        const category = task.category || 'personal';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const total = tasks.length;
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
    }));
};

/**
 * Get productivity heatmap data (average energy by hour of day)
 */
export const getProductivityHeatmap = (energyLogs: EnergyLog[]): HourlyProductivity[] => {
    const hourlyMap = new Map<number, { total: number; count: number }>();

    energyLogs.forEach(log => {
        const date = log.timestamp?.toDate?.() || new Date(log.timestamp);
        const hour = date.getHours();

        const existing = hourlyMap.get(hour) || { total: 0, count: 0 };
        hourlyMap.set(hour, {
            total: existing.total + log.level,
            count: existing.count + 1
        });
    });

    // Create array for all 24 hours
    const result: HourlyProductivity[] = [];
    for (let hour = 0; hour < 24; hour++) {
        const data = hourlyMap.get(hour);
        result.push({
            hour,
            averageEnergy: data ? data.total / data.count : 0,
            count: data?.count || 0
        });
    }

    return result;
};

/**
 * Get date range based on number of days
 */
export const getDateRange = (days: number): { startDate: Date; endDate: Date } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};
