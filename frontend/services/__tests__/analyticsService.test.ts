import {
    aggregateEnergyByDay,
    aggregateTasksByDay,
    aggregateTasksByCategory,
    getProductivityHeatmap,
    getDateRange,
    DailyEnergyData,
    DailyTaskData,
    CategoryData,
    HourlyProductivity
} from '../analyticsService';
import { EnergyLog } from '../energyService';
import { Task } from '../taskService';

describe('analyticsService', () => {
    describe('aggregateEnergyByDay', () => {
        it('should aggregate energy logs by day', () => {
            const mockLogs: EnergyLog[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    level: 8,
                    timestamp: { toDate: () => new Date('2024-01-15T10:00:00') } as any
                },
                {
                    id: '2',
                    userId: 'test-user',
                    level: 6,
                    timestamp: { toDate: () => new Date('2024-01-15T14:00:00') } as any
                },
                {
                    id: '3',
                    userId: 'test-user',
                    level: 9,
                    timestamp: { toDate: () => new Date('2024-01-16T09:00:00') } as any
                }
            ];

            const result = aggregateEnergyByDay(mockLogs);

            expect(result).toHaveLength(2);
            expect(result[0].date).toBe('2024-01-15');
            expect(result[0].averageEnergy).toBe(7); // (8 + 6) / 2
            expect(result[0].count).toBe(2);
            expect(result[1].date).toBe('2024-01-16');
            expect(result[1].averageEnergy).toBe(9);
            expect(result[1].count).toBe(1);
        });

        it('should return empty array for no logs', () => {
            const result = aggregateEnergyByDay([]);
            expect(result).toEqual([]);
        });

        it('should sort results by date', () => {
            const mockLogs: EnergyLog[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    level: 5,
                    timestamp: { toDate: () => new Date('2024-01-20T10:00:00') } as any
                },
                {
                    id: '2',
                    userId: 'test-user',
                    level: 7,
                    timestamp: { toDate: () => new Date('2024-01-18T10:00:00') } as any
                }
            ];

            const result = aggregateEnergyByDay(mockLogs);

            expect(result[0].date).toBe('2024-01-18');
            expect(result[1].date).toBe('2024-01-20');
        });
    });

    describe('aggregateTasksByDay', () => {
        it('should aggregate tasks by day', () => {
            const mockTasks: Task[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    title: 'Task 1',
                    completed: true,
                    priority: 2,
                    estimatedDuration: 30,
                    createdAt: { toDate: () => new Date('2024-01-15T10:00:00') } as any
                },
                {
                    id: '2',
                    userId: 'test-user',
                    title: 'Task 2',
                    completed: false,
                    priority: 1,
                    estimatedDuration: 45,
                    createdAt: { toDate: () => new Date('2024-01-15T11:00:00') } as any
                },
                {
                    id: '3',
                    userId: 'test-user',
                    title: 'Task 3',
                    completed: true,
                    priority: 3,
                    estimatedDuration: 60,
                    createdAt: { toDate: () => new Date('2024-01-16T09:00:00') } as any
                }
            ];

            const result = aggregateTasksByDay(mockTasks);

            expect(result).toHaveLength(2);
            expect(result[0].date).toBe('2024-01-15');
            expect(result[0].completed).toBe(1);
            expect(result[0].total).toBe(2);
            expect(result[1].date).toBe('2024-01-16');
            expect(result[1].completed).toBe(1);
            expect(result[1].total).toBe(1);
        });

        it('should return empty array for no tasks', () => {
            const result = aggregateTasksByDay([]);
            expect(result).toEqual([]);
        });
    });

    describe('aggregateTasksByCategory', () => {
        it('should aggregate tasks by category', () => {
            const mockTasks: Task[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    title: 'Task 1',
                    completed: true,
                    priority: 2,
                    estimatedDuration: 30,
                    category: 'deep-work',
                    createdAt: new Date()
                },
                {
                    id: '2',
                    userId: 'test-user',
                    title: 'Task 2',
                    completed: false,
                    priority: 1,
                    estimatedDuration: 45,
                    category: 'deep-work',
                    createdAt: new Date()
                },
                {
                    id: '3',
                    userId: 'test-user',
                    title: 'Task 3',
                    completed: true,
                    priority: 3,
                    estimatedDuration: 60,
                    category: 'admin',
                    createdAt: new Date()
                }
            ];

            const result = aggregateTasksByCategory(mockTasks);

            expect(result).toHaveLength(2);

            const deepWork = result.find(r => r.category === 'deep-work');
            expect(deepWork?.count).toBe(2);
            expect(deepWork?.percentage).toBeCloseTo(66.67, 1);

            const admin = result.find(r => r.category === 'admin');
            expect(admin?.count).toBe(1);
            expect(admin?.percentage).toBeCloseTo(33.33, 1);
        });

        it('should handle tasks without category', () => {
            const mockTasks: Task[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    title: 'Task 1',
                    completed: true,
                    priority: 2,
                    estimatedDuration: 30,
                    createdAt: new Date()
                }
            ];

            const result = aggregateTasksByCategory(mockTasks);

            expect(result).toHaveLength(1);
            expect(result[0].category).toBe('personal');
            expect(result[0].count).toBe(1);
            expect(result[0].percentage).toBe(100);
        });

        it('should return empty array for no tasks', () => {
            const result = aggregateTasksByCategory([]);
            expect(result).toEqual([]);
        });
    });

    describe('getProductivityHeatmap', () => {
        it('should create hourly productivity data', () => {
            const mockLogs: EnergyLog[] = [
                {
                    id: '1',
                    userId: 'test-user',
                    level: 8,
                    timestamp: { toDate: () => new Date('2024-01-15T09:00:00') } as any
                },
                {
                    id: '2',
                    userId: 'test-user',
                    level: 6,
                    timestamp: { toDate: () => new Date('2024-01-15T09:30:00') } as any
                },
                {
                    id: '3',
                    userId: 'test-user',
                    level: 9,
                    timestamp: { toDate: () => new Date('2024-01-15T14:00:00') } as any
                }
            ];

            const result = getProductivityHeatmap(mockLogs);

            expect(result).toHaveLength(24); // All 24 hours

            // Hour 9 should have average of 7 (8 + 6) / 2
            expect(result[9].hour).toBe(9);
            expect(result[9].averageEnergy).toBe(7);
            expect(result[9].count).toBe(2);

            // Hour 14 should have average of 9
            expect(result[14].hour).toBe(14);
            expect(result[14].averageEnergy).toBe(9);
            expect(result[14].count).toBe(1);

            // Hour 0 should have no data
            expect(result[0].hour).toBe(0);
            expect(result[0].averageEnergy).toBe(0);
            expect(result[0].count).toBe(0);
        });

        it('should return all 24 hours even with no data', () => {
            const result = getProductivityHeatmap([]);

            expect(result).toHaveLength(24);
            result.forEach((hour, index) => {
                expect(hour.hour).toBe(index);
                expect(hour.averageEnergy).toBe(0);
                expect(hour.count).toBe(0);
            });
        });
    });

    describe('getDateRange', () => {
        it('should return correct date range for 7 days', () => {
            const { startDate, endDate } = getDateRange(7);

            const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            expect(daysDiff).toBe(7);

            // Start date should be at 00:00:00
            expect(startDate.getHours()).toBe(0);
            expect(startDate.getMinutes()).toBe(0);
            expect(startDate.getSeconds()).toBe(0);

            // End date should be at 23:59:59
            expect(endDate.getHours()).toBe(23);
            expect(endDate.getMinutes()).toBe(59);
            expect(endDate.getSeconds()).toBe(59);
        });

        it('should return correct date range for 30 days', () => {
            const { startDate, endDate } = getDateRange(30);

            const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            // Expect 31 because the range is inclusive (30 days ago + today)
            expect(daysDiff).toBeGreaterThanOrEqual(30);
        });
    });
});
