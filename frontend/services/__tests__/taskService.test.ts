import {
    createTask,
    updateTask,
    deleteTask,
    getTasks,
    Task,
} from '../taskService';
import { db } from '../../firebaseConfig';

// Mock Firebase
jest.mock('../../firebaseConfig', () => ({
    db: {
        collection: jest.fn(),
    },
    auth: {
        currentUser: { uid: 'test-user-id' },
    },
}));

// Mock Firestore methods
const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockQuery = jest.fn();

describe('taskService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        (db.collection as jest.Mock).mockReturnValue({
            doc: mockDoc,
            where: mockWhere,
            orderBy: mockOrderBy,
        });

        mockDoc.mockReturnValue({
            collection: mockCollection,
            set: mockSetDoc,
            delete: mockDeleteDoc,
        });

        mockCollection.mockReturnValue({
            add: mockAddDoc,
            where: mockWhere,
            orderBy: mockOrderBy,
        });

        mockWhere.mockReturnValue({
            orderBy: mockOrderBy,
        });

        mockOrderBy.mockReturnValue({
            get: mockGetDocs,
        });
    });

    describe('createTask', () => {
        it('should create a new task successfully', async () => {
            const mockTaskData = {
                title: 'Test Task',
                estimatedDuration: 60,
                priority: 3,
            };

            const mockDocRef = { id: 'new-task-id' };
            mockAddDoc.mockResolvedValueOnce(mockDocRef);

            const result = await createTask(mockTaskData);

            expect(result).toBe('new-task-id');
            expect(mockAddDoc).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Test Task',
                    estimatedDuration: 60,
                    priority: 3,
                    completed: false,
                })
            );
        });

        it('should throw error when user is not authenticated', async () => {
            const originalAuth = require('../../firebaseConfig').auth;
            require('../../firebaseConfig').auth = { currentUser: null };

            const mockTaskData = {
                title: 'Test Task',
                estimatedDuration: 60,
                priority: 3,
            };

            await expect(createTask(mockTaskData)).rejects.toThrow('User not authenticated');

            require('../../firebaseConfig').auth = originalAuth;
        });
    });

    describe('updateTask', () => {
        it('should update task successfully', async () => {
            mockSetDoc.mockResolvedValueOnce(undefined);

            await updateTask('task-id', { completed: true });

            expect(mockSetDoc).toHaveBeenCalledWith(
                expect.objectContaining({
                    completed: true,
                }),
                { merge: true }
            );
        });
    });

    describe('deleteTask', () => {
        it('should delete task successfully', async () => {
            mockDeleteDoc.mockResolvedValueOnce(undefined);

            await deleteTask('task-id');

            expect(mockDeleteDoc).toHaveBeenCalled();
        });
    });

    describe('getTasks', () => {
        it('should fetch all tasks for user', async () => {
            const mockTasks = [
                {
                    id: '1',
                    data: () => ({
                        title: 'Task 1',
                        estimatedDuration: 60,
                        priority: 3,
                        completed: false,
                        createdAt: { toDate: () => new Date() },
                    }),
                },
                {
                    id: '2',
                    data: () => ({
                        title: 'Task 2',
                        estimatedDuration: 30,
                        priority: 2,
                        completed: true,
                        createdAt: { toDate: () => new Date() },
                    }),
                },
            ];

            mockGetDocs.mockResolvedValueOnce({
                docs: mockTasks,
            });

            const result = await getTasks();

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe('Task 1');
            expect(result[1].title).toBe('Task 2');
        });

        it('should filter incomplete tasks when requested', async () => {
            const mockTasks = [
                {
                    id: '1',
                    data: () => ({
                        title: 'Task 1',
                        estimatedDuration: 60,
                        priority: 3,
                        completed: false,
                        createdAt: { toDate: () => new Date() },
                    }),
                },
            ];

            mockGetDocs.mockResolvedValueOnce({
                docs: mockTasks,
            });

            await getTasks(false);

            expect(mockWhere).toHaveBeenCalledWith('completed', '==', false);
        });
    });
});
