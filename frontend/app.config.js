

export default ({ config }) => ({
    ...config,
    name: process.env.EXPO_PUBLIC_APP_NAME || 'FluxFlow',
    slug: 'fluxflow',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: process.env.EXPO_PUBLIC_IOS_BUNDLE_ID || 'com.fluxflow.app',
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
        package: process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.fluxflow.app',
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
    },
    web: {
        bundler: 'metro',
        favicon: './assets/favicon.png',
    },
    extra: {
        // Expose environment variables to the app
        EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        EXPO_PUBLIC_ML_SERVICE_URL: process.env.EXPO_PUBLIC_ML_SERVICE_URL,
        EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
        EXPO_PUBLIC_API_TIMEOUT: process.env.EXPO_PUBLIC_API_TIMEOUT,
        EXPO_PUBLIC_ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
        EXPO_PUBLIC_ENABLE_ERROR_TRACKING: process.env.EXPO_PUBLIC_ENABLE_ERROR_TRACKING,
        EXPO_PUBLIC_LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL,
    },
});
