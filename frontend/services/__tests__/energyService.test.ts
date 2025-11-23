import {
    logEnergy,
    getEnergyLogs,
    getLatestEnergyLog,
    EnergyLog,
} from '../energyService';

// Mock Firebase
jest.mock('../../firebaseConfig', () => ({
    db: {
        collection: jest.fn(),
    },
    auth: {
        currentUser: { uid: 'test-user-id' },
    },
}));

const mockCollection = jest.fn();
const mockDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();

describe('energyService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        const { db } = require('../../firebaseConfig');
        (db.collection as jest.Mock).mockReturnValue({
            doc: mockDoc,
            orderBy: mockOrderBy,
        });

        mockDoc.mockReturnValue({
            collection: mockCollection,
        });

        mockCollection.mockReturnValue({
            add: mockAddDoc,
            orderBy: mockOrderBy,
        });

        mockOrderBy.mockReturnValue({
            limit: mockLimit,
            get: mockGetDocs,
        });

        mockLimit.mockReturnValue({
            get: mockGetDocs,
        });
    });

    describe('logEnergy', () => {
        it('should log energy level successfully', async () => {
            const mockDocRef = { id: 'new-log-id' };
            mockAddDoc.mockResolvedValueOnce(mockDocRef);

            const result = await logEnergy(8, 'Feeling great!');

            expect(result).toBe('new-log-id');
            expect(mockAddDoc).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 8,
                    notes: 'Feeling great!',
                })
            );
        });

        it('should validate energy level range', async () => {
            await expect(logEnergy(11)).rejects.toThrow('Energy level must be between 1 and 10');
            await expect(logEnergy(0)).rejects.toThrow('Energy level must be between 1 and 10');
        });

        it('should work without notes', async () => {
            const mockDocRef = { id: 'new-log-id' };
            mockAddDoc.mockResolvedValueOnce(mockDocRef);

            await logEnergy(5);

            expect(mockAddDoc).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 5,
                    notes: '',
                })
            );
        });
    });

    describe('getEnergyLogs', () => {
        it('should fetch energy logs successfully', async () => {
            const mockLogs = [
                {
                    id: '1',
                    data: () => ({
                        level: 8,
                        timestamp: { toDate: () => new Date() },
                        notes: 'Good energy',
                    }),
                },
                {
                    id: '2',
                    data: () => ({
                        level: 5,
                        timestamp: { toDate: () => new Date() },
                        notes: 'Moderate',
                    }),
                },
            ];

            mockGetDocs.mockResolvedValueOnce({
                docs: mockLogs,
            });

            const result = await getEnergyLogs();

            expect(result).toHaveLength(2);
            expect(result[0].level).toBe(8);
            expect(result[1].level).toBe(5);
        });
    });

    describe('getLatestEnergyLog', () => {
        it('should fetch latest energy log', async () => {
            const mockLog = {
                id: '1',
                data: () => ({
                    level: 7,
                    timestamp: { toDate: () => new Date() },
                    notes: 'Latest log',
                }),
            };

            mockGetDocs.mockResolvedValueOnce({
                docs: [mockLog],
            });

            const result = await getLatestEnergyLog();

            expect(result).toBeDefined();
            expect(result?.level).toBe(7);
            expect(mockLimit).toHaveBeenCalledWith(1);
        });

        it('should return null when no logs exist', async () => {
            mockGetDocs.mockResolvedValueOnce({
                docs: [],
            });

            const result = await getLatestEnergyLog();

            expect(result).toBeNull();
        });
    });
});
