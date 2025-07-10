"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase'; // Assuming you have a firebase config file

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    registerWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profile: { displayName?: string; password?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error.code === 'auth/invalid-credential' ||
                    error.code === 'auth/wrong-password')
            ) {
                throw new Error('Invalid email or password.');
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'auth/user-not-found'
            ) {
                throw new Error('No user found with this email.');
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const registerWithEmail = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error.code === 'auth/invalid-credential' ||
                    error.code === 'auth/wrong-password')
            ) {
                throw new Error('Invalid email or password.');
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'auth/user-not-found'
            ) {
                throw new Error('No user found with this email.');
            }
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error;
            }
            if (error instanceof Error) {
                throw error;
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error.code === 'auth/invalid-credential' ||
                    error.code === 'auth/wrong-password')
            ) {
                throw new Error('Invalid email or password.');
            }
            if (
                typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                error.code === 'auth/user-not-found'
            ) {
                throw new Error('No user found with this email.');
            }
        }
    };

    const updateProfile = async (profile: { displayName?: string; password?: string; photoURL?: string }) => {
        if (!auth.currentUser) throw new Error('No user is currently signed in');
        await firebaseUpdateProfile(auth.currentUser, profile);
        // Optionally, update local user state
        setUser({ ...auth.currentUser });
    };

    const value = { user, loading, signInWithGoogle, registerWithEmail, signInWithEmail, logout, updateProfile };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
