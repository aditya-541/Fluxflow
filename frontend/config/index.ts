import Constants from 'expo-constants';

/**
 * Centralized configuration for the FluxFlow app
 * Uses environment variables from Expo Constants
 */

interface Config {
    firebase: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
    };
    mlService: {
        url: string;
        timeout: number;
    };
    app: {
        env: 'development' | 'staging' | 'production';
        version: string;
    };
    features: {
        analytics: boolean;
        errorTracking: boolean;
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
    };
}

const getEnvVar = (key: string, fallback?: string): string => {
    const value = Constants.expoConfig?.extra?.[key] || process.env[key];
    if (!value && !fallback) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value || fallback || '';
};

const config: Config = {
    firebase: {
        apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
        authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
        projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
        storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
        messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
        appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
    },
    mlService: {
        url: getEnvVar('EXPO_PUBLIC_ML_SERVICE_URL', 'http://localhost:8000'),
        timeout: parseInt(getEnvVar('EXPO_PUBLIC_API_TIMEOUT', '10000'), 10),
    },
    app: {
        env: (getEnvVar('EXPO_PUBLIC_APP_ENV', 'development') as Config['app']['env']),
        version: Constants.expoConfig?.version || '1.0.0',
    },
    features: {
        analytics: getEnvVar('EXPO_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
        errorTracking: getEnvVar('EXPO_PUBLIC_ENABLE_ERROR_TRACKING', 'false') === 'true',
    },
    logging: {
        level: (getEnvVar('EXPO_PUBLIC_LOG_LEVEL', 'info') as Config['logging']['level']),
    },
};

// Validate critical configuration
const validateConfig = () => {
    const requiredFields = [
        config.firebase.apiKey,
        config.firebase.authDomain,
        config.firebase.projectId,
        config.firebase.appId,
    ];

    const missingFields = requiredFields.filter(field => !field);
    if (missingFields.length > 0) {
        throw new Error(
            'Missing required Firebase configuration. Please check your .env file and ensure all EXPO_PUBLIC_FIREBASE_* variables are set.'
        );
    }
};

// Validate on import
validateConfig();

export default config;
