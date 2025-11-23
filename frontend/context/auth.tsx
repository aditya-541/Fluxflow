import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signup: async () => { },
    login: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

function useProtectedRoute(user: User | null, loading: boolean) {
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    useEffect(() => {
        if (loading) return;
        if (!navigationState?.key) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            // Redirect to the sign-in page
            setTimeout(() => router.replace('/(auth)/login'), 0);
        } else if (user && inAuthGroup) {
            // Redirect away from the sign-in page
            setTimeout(() => router.replace('/(tabs)/dashboard'), 0);
        }
    }, [user, segments, navigationState?.key, loading]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Create or ensure user document exists
    const ensureUserDocument = async (user: User) => {
        try {
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create user document if it doesn't exist
                await setDoc(userRef, {
                    email: user.email,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    settings: {
                        theme: 'system',
                        notificationsEnabled: true,
                    },
                });
            }
        } catch (error) {
            console.error('Error creating user document:', error);
            // Don't block authentication if Firestore fails
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Try to ensure user document exists, but don't block on it
                ensureUserDocument(user).catch(console.error);
            }
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useProtectedRoute(user, loading);

    const signup = async (email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document immediately after signup
        await ensureUserDocument(userCredential.user);
    };

    const login = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Ensure user document exists on login
        await ensureUserDocument(userCredential.user);
    };

    const logout = () => firebaseSignOut(auth);

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
