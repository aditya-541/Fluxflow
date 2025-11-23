import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * Validation helper for user data
 */
const validateUserData = (data: any): boolean => {
    if (!data.email || typeof data.email !== 'string') {
        return false;
    }
    return true;
};

/**
 * Cloud Function triggered when a new user is created
 * Creates a user profile document in Firestore
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
    try {
        const db = admin.firestore();

        const userData = {
            email: user.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            settings: {
                theme: "system",
                notificationsEnabled: true,
            },
        };

        // Validate data before writing
        if (!validateUserData(userData)) {
            functions.logger.error("Invalid user data", { uid: user.uid });
            throw new Error("Invalid user data");
        }

        await db.collection("users").doc(user.uid).set(userData);

        functions.logger.info("User profile created successfully", {
            uid: user.uid,
            email: user.email
        });
    } catch (error) {
        functions.logger.error("Error creating user profile", {
            uid: user.uid,
            error: error instanceof Error ? error.message : String(error),
        });
        // Don't throw - we don't want to block user creation
        // The user can still authenticate, profile can be created later
    }
});

/**
 * Cloud Function to clean up user data when account is deleted
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
    try {
        const db = admin.firestore();
        const batch = db.batch();

        // Delete user document
        batch.delete(db.collection("users").doc(user.uid));

        // Delete all user tasks
        const tasksSnapshot = await db
            .collection("users")
            .doc(user.uid)
            .collection("tasks")
            .get();

        tasksSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Delete all energy logs
        const energyLogsSnapshot = await db
            .collection("users")
            .doc(user.uid)
            .collection("energy_logs")
            .get();

        energyLogsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        functions.logger.info("User data deleted successfully", {
            uid: user.uid,
            tasksDeleted: tasksSnapshot.size,
            energyLogsDeleted: energyLogsSnapshot.size,
        });
    } catch (error) {
        functions.logger.error("Error deleting user data", {
            uid: user.uid,
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
