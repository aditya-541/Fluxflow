import { generateSchedule, ScheduledTask } from '../scheduleService';
import { Task } from '../taskService';
import { EnergyLog } from '../energyService';

// Mock fetch globally
global.fetch = jest.fn();

describe('scheduleService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateSchedule', () => {
        const mockTasks: Task[] = [
            {
                id: '1',
                title: 'Deep Work',
                estimatedDuration: 120,
                priority: 5,
                completed: false,
                createdAt: new Date(),
            },
            {
                id: '2',
                title: 'Email',
                estimatedDuration: 15,
                priority: 2,
                completed: false,
                createdAt: new Date(),
            },
        ];

        const mockEnergyLog: EnergyLog = {
            id: '1',
            level: 8,
            timestamp: new Date(),
            notes: '',
        };

        it('should successfully fetch schedule from ML service', async () => {
            const mockResponse: ScheduledTask[] = [
                {
                    task_id: '1',
                    start_time: new Date().toISOString(),
                    end_time: new Date(Date.now() + 120 * 60000).toISOString(),
                    confidence_score: 0.9,
                },
                {
                    task_id: '2',
                    start_time: new Date(Date.now() + 130 * 60000).toISOString(),
                    end_time: new Date(Date.now() + 145 * 60000).toISOString(),
                    confidence_score: 0.85,
                },
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const result = await generateSchedule(mockTasks, mockEnergyLog);

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should use local fallback when ML service is unavailable', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await generateSchedule(mockTasks, mockEnergyLog, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
            expect(result[0].task_id).toBeDefined();
            expect(result[0].confidence_score).toBe(0.75);
        });

        it('should throw error when ML service fails and fallback is disabled', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                generateSchedule(mockTasks, mockEnergyLog, false)
            ).rejects.toThrow();
        });

        it('should handle timeout correctly', async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(
                () => new Promise((resolve) => setTimeout(resolve, 15000))
            );

            const result = await generateSchedule(mockTasks, mockEnergyLog, true);

            // Should fall back to local scheduling
            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        it('should prioritize hard tasks for high energy in local fallback', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const highEnergyLog: EnergyLog = {
                id: '1',
                level: 9,
                timestamp: new Date(),
                notes: '',
            };

            const result = await generateSchedule(mockTasks, highEnergyLog, true);

            // First task should be the high priority one
            expect(result[0].task_id).toBe('1'); // Deep Work
        });

        it('should prioritize quick tasks for low energy in local fallback', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const lowEnergyLog: EnergyLog = {
                id: '1',
                level: 2,
                timestamp: new Date(),
                notes: '',
            };

            const result = await generateSchedule(mockTasks, lowEnergyLog, true);

            // First task should be the quick one
            expect(result[0].task_id).toBe('2'); // Email
        });

        it('should handle null energy log gracefully', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await generateSchedule(mockTasks, null, true);

            expect(result).toBeDefined();
            expect(result.length).toBe(2);
        });

        it('should add 10-minute buffer between tasks', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await generateSchedule(mockTasks, mockEnergyLog, true);

            const firstEnd = new Date(result[0].end_time);
            const secondStart = new Date(result[1].start_time);
            const bufferMinutes = (secondStart.getTime() - firstEnd.getTime()) / 60000;

            expect(bufferMinutes).toBe(10);
        });
    });
});
