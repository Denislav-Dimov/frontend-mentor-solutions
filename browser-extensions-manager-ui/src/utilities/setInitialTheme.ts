import { LC_KEY } from '../context/ThemeProvider';

export default function setInitialTheme() {
  const stored = localStorage.getItem(LC_KEY);

  const theme =
    stored ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.body.classList.toggle('dark', theme === 'dark');
}
