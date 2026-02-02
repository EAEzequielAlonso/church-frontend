'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import AuthHandshake from '@/components/auth/AuthHandshake';
import { SystemRole } from '@/types/auth-types';

interface User {
    id: string;
    email: string;
    fullName: string;
    ecclesiasticalRole?: string;
    isOnboarded: boolean;
    avatarUrl?: string;
    personId?: string;
    memberId?: string;
    roles?: string[]; // Functional roles from backend
    permissions?: string[];
    systemRole?: SystemRole;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    churchId?: string | null;
    isLoading: boolean;
    login: (token: string, userData: User, churchId?: string) => void;
    logout: () => void;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

    if (!domain || !clientId) {
        console.warn("Auth0 domain or client ID missing in environment variables");
    }

    return (
        <Auth0Provider
            domain={domain || ''}
            clientId={clientId || ''}
            authorizationParams={{
                redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
            }}
        >
            <AuthContextContent>{children}</AuthContextContent>
        </Auth0Provider>
    );
}

function AuthContextContent({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { logout: auth0Logout } = useAuth0();

    const [churchId, setChurchId] = useState<string | null>(null);

    useEffect(() => {
        const validateSession = async () => {
            const storedToken = localStorage.getItem('accessToken');
            const userData = localStorage.getItem('user');

            if (!storedToken) {
                setIsLoading(false);
                return;
            }
            setToken(storedToken);

            // specific check: verify with backend if token is still valid (db wipe check)
            try {
                // Use imported api instance which handles Authorization header automatically if token in localStorage
                // But wait, api instance might read from localStorage too.
                // Assuming api interceptor reads localStorage.

                // We optimistically set user first to show UI if we want, OR wait.
                // Given the issue "user thinks they are onboarded but they are not", we should probably WAIT or update immediately.

                const res = await api.get('/auth/me');

                // If success, update local state with TRUTH from backend
                const backendUser = res.data;
                // Backend /auth/me returns the user object.
                // We should also check if we have a valid churchId in the context or if the backend returns it.
                // /auth/me currently returns req.user (from JwtStrategy).
                // JwtStrategy returns payload + some extras.

                // Let's ensure we get the full picture.
                // Ideally /auth/me returns { user, churchId } ... 
                // Currently AuthController.getProfile just returns req.user.
                // req.user has { id, email, personId, churchId, roles ... } from JWT strategy?
                // Let's check JwtStrategy return.

                // Assuming res.data is the user object with basic fields.

                // Update everything
                setUser(backendUser);
                if (backendUser.churchId) {
                    setChurchId(backendUser.churchId);
                    localStorage.setItem('churchId', backendUser.churchId);
                } else {
                    setChurchId(null);
                    localStorage.removeItem('churchId');
                }

                localStorage.setItem('user', JSON.stringify(backendUser));

                // Redirect logic if state mismatches?
                // If backend says Not Onboarded, but we are on dashboard... layout handles that?
                // Layout checks !user -> login.
                // Does layout check onboarding? No, layout just checks user existence.
                // We need to enforce onboarding redirect here or in a middleware.

                if (!backendUser.isOnboarded) {
                    if (window.location.pathname.startsWith('/dashboard')) {
                        router.push('/onboarding');
                    }
                }

            } catch (error) {
                console.warn('Session invalid', error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('churchId');
                setUser(null);
                setChurchId(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateSession();
    }, [router]);

    const login = (token: string, userData: User, churchId?: string) => {
        localStorage.setItem('accessToken', token);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        if (churchId) {
            localStorage.setItem('churchId', churchId);
            setChurchId(churchId);
        }

        if (userData.isOnboarded) {
            router.push('/dashboard');
        } else {
            router.push('/onboarding');
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('churchId');
        setUser(null);
        setChurchId(null);
        auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const refreshSession = async () => {
        try {
            const res = await api.get('/auth/me');
            const backendUser = res.data;
            setUser(backendUser);
            if (backendUser.churchId) {
                setChurchId(backendUser.churchId);
                localStorage.setItem('churchId', backendUser.churchId);
            } else {
                // Keep existing churchId if backend doesn't return one explicitly (e.g. if getting profile checks only user table)
                // But my updated getProfile returns churchId from token.
            }
            localStorage.setItem('user', JSON.stringify(backendUser));
        } catch (error) {
            console.error('Failed to refresh session', error);
        }
    };

    return (

        <AuthContext.Provider value={{ user, token, churchId, isLoading, login, logout, refreshSession }}>
            <AuthHandshake>
                {children}
            </AuthHandshake>
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
