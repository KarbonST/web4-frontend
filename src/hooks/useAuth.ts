import React from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const ctx = React.useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
};
