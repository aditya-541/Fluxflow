// Mock Firebase
jest.mock('./firebaseConfig', () => ({
    auth: {
        currentUser: { uid: 'test-user-id' },
    },
    db: {},
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {},
        version: '1.0.0',
    },
}));

// Suppress console warnings in tests
global.console = {
    ...console,
    warn: jest.fn(),
    error: jest.fn(),
};
