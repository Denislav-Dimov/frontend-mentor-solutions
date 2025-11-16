import { useState, useEffect, type PropsWithChildren } from 'react';
import ThemeContext from './ThemeContext';
import { getPreferredTheme } from '../utilities/getPreferredTheme';

export const LC_KEY = 'Browser Extensions Theme';

export type Theme = 'dark' | 'light';
export type ThemeContextType = {
  theme: Theme | string;
  toggleTheme: () => void;
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme | string>(() => {
    const stored = localStorage.getItem(LC_KEY);
    return stored ? stored : getPreferredTheme();
  });

  function toggleTheme() {
    setTheme((prevTheme): Theme => {
      if (prevTheme === 'dark') {
        saveTheme('light');
        return 'light';
      } else {
        saveTheme('dark');
        return 'dark';
      }
    });
  }

  function saveTheme(theme: Theme) {
    localStorage.setItem(LC_KEY, theme);
  }

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
