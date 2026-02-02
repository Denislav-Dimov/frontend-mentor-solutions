'use client';

import SearchIcon from '@/components/icons/SearchIcon';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function SearchInput() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const key = 'search';

  const [inputValue, setInputValue] = useState(searchParams.get(key) || '');

  useEffect(() => {
    if (inputValue === (searchParams.get(key) || '')) return;

    const delay = setTimeout(() => {
      const value = inputValue.trim();
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(delay);
  }, [inputValue, pathname, replace, searchParams]);

  return (
    <div className="w-full max-w-lg flex items-center gap-6 px-8 md:px-6 py-3.5 rounded-md bg-white dark:bg-dark-blue-900 shadow">
      <SearchIcon className="size-5 fill-light-grey-400 dark:fill-white min-w-fit" />

      <input
        type="text"
        className="text-sm w-full text-light-grey-400 dark:text-white placeholder:text-light-grey-400 dark:placeholder:text-white focus-within:outline-0"
        onChange={e => setInputValue(e.currentTarget.value)}
        value={inputValue}
        placeholder="Search for a country..."
      />
    </div>
  );
}
