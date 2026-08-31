import type { Theme } from '../context/ThemeProvider';

export const getPreferredTheme = (): Theme => {
  const prefersDark: boolean =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};
