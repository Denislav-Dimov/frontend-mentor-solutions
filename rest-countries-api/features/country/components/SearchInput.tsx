'use client';

import { useQueryState, debounce } from 'nuqs';
import { Search } from 'lucide-react';

export default function SearchInput() {
  /*
   * This actually took me 2 weeks of figuring out how to manage
   * this query state the manual way with "useSearchParams, usePathname, useRouter",
   * there were so many bugs and I couldn't fix them.
   * Finally I found a package and I now don't know if I should feel joy or disappointment
   */
  const [search, setSearch] = useQueryState('search', {
    defaultValue: '',
    shallow: false,
    limitUrlUpdates: debounce(300),
  });

  return (
    <div className="w-full max-w-lg flex items-center gap-6 px-8 md:px-6 py-3.5 rounded-md bg-white dark:bg-dark-blue-900 shadow">
      <Search className="size-5 text-light-grey-400 dark:text-white min-w-fit" />

      <input
        type="text"
        className="text-sm w-full text-light-grey-400 dark:text-white placeholder:text-light-grey-400 dark:placeholder:text-white focus-within:outline-0"
        onChange={e => setSearch(e.currentTarget.value)}
        value={search}
        placeholder="Search for a country..."
      />
    </div>
  );
}
