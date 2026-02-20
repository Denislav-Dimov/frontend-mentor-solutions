'use client';

import { useState } from 'react';
import { useQueryState } from 'nuqs';
import { ChevronDown } from 'lucide-react';

const regions = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function FilterRegion() {
  const [isOpen, setIsOpen] = useState(false);
  const [region, setRegion] = useQueryState('region', {
    defaultValue: regions[0],
    shallow: false,
  });

  function handleOption(selectedRegion: string) {
    setIsOpen(false);
    setRegion(selectedRegion);
  }

  return (
    <div className="relative text-sm text-light-grey-950 dark:text-white w-fit">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-6 px-6 py-5 bg-white dark:bg-dark-blue-900 rounded-md shadow cursor-pointer"
      >
        <span>{region === regions[0] ? 'Filter by Region' : region}</span>

        <ChevronDown
          className={`size-5 text-light-grey-950 dark:text-white min-w-fit transition-all ${isOpen && 'rotate-180'}`}
        />
      </button>

      {isOpen && (
        <ul className="absolute w-full z-10 mt-1 py-3 bg-white dark:bg-dark-blue-900 rounded-md shadow animate-fade-in-fast">
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

export function FilterRegionSkeleton() {
  return (
    <div className="h-15 w-full max-w-48 animate-pulse rounded-md bg-light-grey-400/20 dark:bg-dark-blue-900/50 md:ml-auto" />
  );
}
