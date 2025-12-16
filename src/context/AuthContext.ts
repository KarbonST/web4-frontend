import React from 'react';
import type { LoginPayload, RegisterPayload, User } from '../types';

export interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
}

export const AuthContext = React.createContext<AuthContextValue | null>(null);
