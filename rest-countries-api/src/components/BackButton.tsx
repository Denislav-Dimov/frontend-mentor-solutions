'use client';

import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton() {
  const { back, push } = useRouter();

  function handleClick() {
    if (window.history.length > 1) {
      back();
    } else {
      push('/');
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 bg-white dark:bg-dark-blue-900 px-8 py-2 rounded-lg shadow-md shadow-light-grey-950/20 transition-all duration-300 hover:shadow-lg hover:bg-white/40 dark:hover:bg-dark-blue-900/40 cursor-pointer"
    >
      <MoveLeft className="size-5 text-light-grey-950 dark:text-white min-w-fit" />
      <span className="font-light">Back</span>
    </button>
  );
}
