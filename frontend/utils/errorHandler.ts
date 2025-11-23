/**
 * Centralized error handling utility for FluxFlow
 */

export enum ErrorType {
    NETWORK = 'NETWORK',
    AUTH = 'AUTH',
    VALIDATION = 'VALIDATION',
    NOT_FOUND = 'NOT_FOUND',
    PERMISSION = 'PERMISSION',
    SERVER = 'SERVER',
    UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
    type: ErrorType;
    userMessage: string;
    originalError?: Error;

    constructor(
        type: ErrorType,
        userMessage: string,
        originalError?: Error
    ) {
        super(userMessage);
        this.name = 'AppError';
        this.type = type;
        this.userMessage = userMessage;
        this.originalError = originalError;
    }
}

/**
 * Categorize and handle errors with user-friendly messages
 */
export const handleError = (error: unknown): AppError => {
    // Already an AppError
    if (error instanceof AppError) {
        return error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return new AppError(
            ErrorType.NETWORK,
            'Unable to connect. Please check your internet connection.',
            error as Error
        );
    }

    // Firebase auth errors
    if (error instanceof Error) {
        const errorCode = (error as any).code;

        if (errorCode?.startsWith('auth/')) {
            const authMessages: Record<string, string> = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/email-already-in-use': 'An account with this email already exists.',
                'auth/weak-password': 'Password should be at least 6 characters.',
                'auth/invalid-email': 'Invalid email address.',
                'auth/user-disabled': 'This account has been disabled.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
            };

            return new AppError(
                ErrorType.AUTH,
                authMessages[errorCode] || 'Authentication failed. Please try again.',
                error
            );
        }

        // Firestore permission errors
        if (errorCode?.startsWith('permission-denied')) {
            return new AppError(
                ErrorType.PERMISSION,
                'You do not have permission to perform this action.',
                error
            );
        }

        // Not found errors
        if (errorCode?.startsWith('not-found')) {
            return new AppError(
                ErrorType.NOT_FOUND,
                'The requested resource was not found.',
                error
            );
        }
    }

    // Default error
    return new AppError(
        ErrorType.UNKNOWN,
        'An unexpected error occurred. Please try again.',
        error as Error
    );
};

/**
 * Log error with context
 */
export const logError = (error: AppError, context?: Record<string, any>) => {
    console.error('[AppError]', {
        type: error.type,
        message: error.userMessage,
        originalError: error.originalError?.message,
        stack: error.originalError?.stack,
        context,
    });

    // In production, send to error tracking service (e.g., Sentry)
    // if (config.features.errorTracking) {
    //   Sentry.captureException(error, { extra: context });
    // }
};

/**
 * Display error to user
 */
export const showError = (error: unknown, context?: Record<string, any>) => {
    const appError = handleError(error);
    logError(appError, context);

    // Return user-friendly message
    return appError.userMessage;
};
