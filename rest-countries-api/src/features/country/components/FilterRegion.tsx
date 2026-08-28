'use client';

import { useQueryState } from 'nuqs';
import { ChevronDown } from 'lucide-react';

const regions = ['Filter by Region', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export default function FilterRegion() {
  const [region, setRegion] = useQueryState('region', {
    defaultValue: regions[0],
    shallow: false,
  });

  return (
    <div className="relative w-full max-w-48 text-sm text-light-grey-950 dark:text-white">
      <label htmlFor="region-filter" className="sr-only">
        Filter countries by region
      </label>
      <select
        id="region-filter"
        value={region}
        onChange={event => setRegion(event.currentTarget.value)}
        className="w-full appearance-none rounded-md bg-white px-6 py-5 pr-12 shadow outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-dark-blue-900"
      >
        {regions.map(region => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2"
      />
    </div>
  );
}

export function FilterRegionSkeleton() {
  return (
    <div className="h-15 w-full max-w-48 animate-pulse rounded-md bg-light-grey-400/10 dark:bg-dark-blue-900/50 md:ml-auto" />
  );
}
