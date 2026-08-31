import { useState, useEffect, type PropsWithChildren } from 'react';
import ThemeContext from './theme.context';
import useLocalStorage from '../../../hooks/useLocalStorage';

type theme = 'dark' | 'light';

export default function ThemeProvider({ children }: PropsWithChildren) {
  const { getItem, setItem } = useLocalStorage<theme>('theme');

  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = getItem();

    if (stored === 'dark') return true;
    if (stored === 'light') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  function toggleDark() {
    setIsDark(prev => !prev);
  }

  useEffect(() => {
    setItem(isDark ? 'dark' : 'light');
  }, [setItem, isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
