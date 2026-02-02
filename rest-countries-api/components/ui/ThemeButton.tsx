'use client';

import { useTheme } from 'next-themes';
import MoonIcon from '@/components/icons/MoonIcon';

export default function ButtonTheme() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 cursor-pointer text-sm"
    >
      <MoonIcon />
      <span>Dark Mode</span>
    </button>
  );
}
