import React from 'react';
import { authApi } from '../api/auth';
import { ApiError } from '../api/client';
import type { LoginPayload, RegisterPayload, User } from '../types';
import { AuthContext } from './AuthContext';

const TOKEN_STORAGE_KEY = 'models-token';
const USER_STORAGE_KEY = 'models-user';

const readStoredJson = <T,>(key: string): T | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
        console.error('Failed to read auth payload', error);
        return null;
    }
};

const readStoredToken = (): string | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (error) {
        console.error('Failed to read token from storage', error);
        return null;
    }
};

const persistAuthState = (token: string | null, user: User | null) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
        }

        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    } catch (error) {
        console.error('Failed to persist auth state', error);
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = React.useState<string | null>(() => readStoredToken());
    const [user, setUser] = React.useState<User | null>(() => readStoredJson<User>(USER_STORAGE_KEY));
    const [isLoading, setIsLoading] = React.useState(false);

    const setAuthPayload = React.useCallback((nextToken: string | null, nextUser: User | null) => {
        setToken(nextToken);
        setUser(nextUser);
        persistAuthState(nextToken, nextUser);
    }, []);

    const login = React.useCallback(async (payload: LoginPayload) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(payload);
            setAuthPayload(response.token, response.user ?? null);
        } catch (errorInstance) {
            if (errorInstance instanceof ApiError || errorInstance instanceof Error) {
                console.error('Login failed', errorInstance);
            }
            throw errorInstance;
        } finally {
            setIsLoading(false);
        }
    }, [setAuthPayload]);

    const register = React.useCallback(async (payload: RegisterPayload) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(payload);
            setAuthPayload(response.token, response.user ?? null);
        } catch (errorInstance) {
            if (errorInstance instanceof ApiError || errorInstance instanceof Error) {
                console.error('Registration failed', errorInstance);
            }
            throw errorInstance;
        } finally {
            setIsLoading(false);
        }
    }, [setAuthPayload]);

    const logout = React.useCallback(() => {
        setAuthPayload(null, null);
    }, [setAuthPayload]);

    const value = React.useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(token),
        isLoading,
        login,
        register,
        logout,
    }), [user, token, isLoading, login, register, logout]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
