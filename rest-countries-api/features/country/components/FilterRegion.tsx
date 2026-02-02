'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ChevronIcon from '@/components/icons/ChevronIcon';

const regions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function FilterRegion() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const key = 'region';

  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useState(regions[0]);

  function handleOption(selectedRegion: string) {
    setIsOpen(false);
    setRegion(selectedRegion);

    const params = new URLSearchParams(searchParams.toString());

    if (selectedRegion === regions[0]) {
      params.delete(key);
    } else {
      params.set(key, selectedRegion);
    }

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative text-sm text-light-grey-950 dark:text-white w-fit">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-6 px-6 py-5 bg-white dark:bg-dark-blue-900 rounded-md shadow cursor-pointer"
      >
        <span>{region === regions[0] ? 'Filter by Region' : region}</span>
        <ChevronIcon
          className={`size-5 fill-light-grey-400 dark:fill-white min-w-fit transition-all ${isOpen && 'rotate-180'}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute w-full z-10 mt-1 py-3 bg-white dark:bg-dark-blue-900 rounded-md shadow">
          {regions.map(region => (
            <li
              key={region}
              onClick={() => handleOption(region)}
              className="px-6 py-1 cursor-pointer hover:bg-light-grey-400/10 dark:hover:bg-dark-blue-950/50 transition-colors"
            >
              {region}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
