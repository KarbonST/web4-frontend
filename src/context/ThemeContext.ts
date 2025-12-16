import React from 'react';

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
    theme: Theme;
    toggle: () => void;
}

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);
