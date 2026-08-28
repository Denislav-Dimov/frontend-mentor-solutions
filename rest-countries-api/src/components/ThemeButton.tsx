'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import moonLightIcon from '@/assets/moon-light.svg';
import moonDarkIcon from '@/assets/moon-dark.svg';

export default function ButtonTheme() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className="flex items-center gap-3 cursor-pointer text-sm"
    >
      <Moon />
      <span>Dark Mode</span>
    </button>
  );
}

function Moon() {
  return (
    <>
      <Image src={moonLightIcon} alt="" className="dark:hidden block size-4" />

      <Image src={moonDarkIcon} alt="" className="hidden dark:block size-4" />
    </>
  );
}
