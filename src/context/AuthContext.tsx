'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    fullName: string;
    isPlatformAdmin?: boolean;
}

interface AuthContextType {
    user: User | null;
    churchId: string | null;
    token: string | null;
    login: (token: string, user: User, churchId: string | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [churchId, setChurchId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Load from localStorage on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedChurchId = localStorage.getItem('churchId');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            if (storedChurchId) setChurchId(storedChurchId);
        }
    }, []);

    const login = (newToken: string, newUser: User, newChurchId: string | null) => {
        setToken(newToken);
        setUser(newUser);
        setChurchId(newChurchId);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        if (newChurchId) {
            localStorage.setItem('churchId', newChurchId);
        } else {
            localStorage.removeItem('churchId');
        }

        // Redirection Logic
        if (newUser.isPlatformAdmin) {
            router.push('/admin-dashboard');
        } else if (newChurchId) {
            router.push('/dashboard');
        } else {
            // Fallback or setup flow
            router.push('/dashboard');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setChurchId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('churchId');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, churchId, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
