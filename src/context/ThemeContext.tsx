import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'combo';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isCombo: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  isCombo: true,
  isLight: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arkaja_theme');
      if (saved === 'dark') return 'dark';
      if (saved === 'light' || saved === 'combo') return 'light';
    }
    return 'light'; // App starts with LIGHT MODE ONLY first
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('combo', 'dark', 'light');
    // Ensure combo and light apply identical bright classing
    root.classList.add(theme === 'dark' ? 'dark' : 'light');
    if (theme === 'combo') root.classList.add('combo');
    localStorage.setItem('arkaja_theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    // Light mode and combo mode are identical
    setThemeState(t === 'combo' ? 'light' : t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDarkMode = theme === 'dark';
  const isLightMode = !isDarkMode;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: isDarkMode,
        isCombo: false,
        isLight: isLightMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
