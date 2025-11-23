import { Task } from './taskService';
import { EnergyLog } from './energyService';
import config from '../config';

// ML service configuration from centralized config
const ML_SERVICE_URL = config.mlService.url;
const REQUEST_TIMEOUT = config.mlService.timeout;

export interface ScheduledTask {
    task_id: string;
    start_time: string;
    end_time: string;
    confidence_score: number;
}

/**
 * Local fallback scheduling when ML service is unavailable
 */
const localSchedule = (tasks: Task[], currentEnergy: EnergyLog | null): ScheduledTask[] => {
    const energy = currentEnergy?.level || 5;
    let sortedTasks: Task[];

    // Energy-aware local sorting
    if (energy >= 8) {
        // High energy: tackle hard tasks first
        sortedTasks = [...tasks].sort((a, b) =>
            (b.priority * 2 + b.estimatedDuration / 30) - (a.priority * 2 + a.estimatedDuration / 30)
        );
    } else if (energy >= 4) {
        // Medium energy: balanced
        sortedTasks = [...tasks].sort((a, b) =>
            (b.priority + b.estimatedDuration / 60) - (a.priority + a.estimatedDuration / 60)
        );
    } else {
        // Low energy: quick wins
        sortedTasks = [...tasks].sort((a, b) => a.estimatedDuration - b.estimatedDuration);
    }

    const scheduled: ScheduledTask[] = [];
    let currentTime = new Date();

    sortedTasks.forEach(task => {
        const startTime = new Date(currentTime.getTime() + 10 * 60000); // 10 min buffer
        const endTime = new Date(startTime.getTime() + task.estimatedDuration * 60000);

        scheduled.push({
            task_id: task.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            confidence_score: 0.75
        });

        currentTime = endTime;
    });

    return scheduled;
};

/**
 * Fetch with timeout
 */
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    return Promise.race([
        fetch(url, options),
        new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ]);
};

export const generateSchedule = async (
    tasks: Task[],
    currentEnergy: EnergyLog | null,
    useLocalFallback = true
): Promise<ScheduledTask[]> => {
    try {
        const response = await fetchWithTimeout(
            `${ML_SERVICE_URL}/predict-schedule`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tasks: tasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        estimated_duration_minutes: t.estimatedDuration,
                        priority: t.priority
                    })),
                    user_state: {
                        energy_level: currentEnergy ? currentEnergy.level : 5,
                        current_time: new Date().toISOString()
                    }
                }),
            },
            REQUEST_TIMEOUT
        );

        if (!response.ok) {
            throw new Error(`ML service returned ${response.status}`);
        }

        const scheduledTasks: ScheduledTask[] = await response.json();
        return scheduledTasks;
    } catch (error) {
        console.warn("ML service unavailable, using local scheduling:", error);

        if (useLocalFallback) {
            return localSchedule(tasks, currentEnergy);
        }

        throw error;
    }
};
