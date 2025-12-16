import React from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
    const ctx = React.useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
};
