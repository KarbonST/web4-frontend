import React from 'react';
import type { Theme } from './ThemeContext';
import { ThemeContext } from './ThemeContext';
type ThemeSource = 'system' | 'manual';

type ThemeState = {
    mode: Theme;
    source: ThemeSource;
};

type ThemeAction =
    | { type: 'toggle' }
    | { type: 'system-change'; mode: Theme };

const THEME_STORAGE_KEY = 'theme-preference';

const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initThemeState = (): ThemeState => {
    if (typeof window === 'undefined') {
        return { mode: 'dark', source: 'system' };
    }

    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (stored === 'light' || stored === 'dark') {
            return { mode: stored, source: 'manual' };
        }
    } catch (error) {
        console.error('Failed to load theme preference', error);
    }

    return { mode: getSystemTheme(), source: 'system' };
};

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
    switch (action.type) {
        case 'toggle':
            return {
                mode: state.mode === 'dark' ? 'light' : 'dark',
                source: 'manual',
            };
        case 'system-change':
            if (state.source !== 'system' || state.mode === action.mode) {
                return state;
            }
            return { ...state, mode: action.mode };
        default:
            return state;
    }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = React.useReducer(themeReducer, undefined, initThemeState);

    React.useEffect(() => {
        document.body.classList.remove('dark', 'light');
        document.body.classList.add(state.mode);
    }, [state.mode]);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (state.source === 'manual') {
                localStorage.setItem(THEME_STORAGE_KEY, state.mode);
            } else {
                localStorage.removeItem(THEME_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to persist theme preference', error);
        }
    }, [state]);

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (event: MediaQueryListEvent) => {
            dispatch({ type: 'system-change', mode: event.matches ? 'dark' : 'light' });
        };
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleChange);
            return () => media.removeEventListener('change', handleChange);
        }
        media.addListener(handleChange);
        return () => media.removeListener(handleChange);
    }, []);

    const toggle = React.useCallback(() => dispatch({ type: 'toggle' }), []);

    const value = React.useMemo(() => ({ theme: state.mode, toggle }), [state.mode, toggle]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
