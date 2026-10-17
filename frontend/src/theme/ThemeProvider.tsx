import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeMode, ResolvedTheme } from './ThemeContext';

const STORAGE_KEY = 'artha-theme';

const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch {
    // Ignore storage errors
  }
  return 'system';
};

const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemPreference);

  const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

  // Apply dark class and handle transitions
  const applyTheme = useCallback((theme: ResolvedTheme, animate = false) => {
    const root = document.documentElement;

    if (animate) {
      root.classList.add('theme-transitioning');
    }

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (animate) {
      window.setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 250);
    }
  }, []);

  // Update theme when resolvedTheme changes
  useEffect(() => {
    applyTheme(resolvedTheme, true);
  }, [resolvedTheme, applyTheme]);

  // Listen to live system preference changes when mode is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Storage unavailable
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
