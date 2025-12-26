import { useState, useEffect, type PropsWithChildren } from 'react';
import ThemeContext from './theme.context';

export default function ThemeProvider({ children }: PropsWithChildren) {
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  function toggleDark() {
    setIsDark(prev => !prev);
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}
