import { Suspense } from 'react';
import {
  SearchInput,
  SearchInputSkeleton,
  FilterRegion,
  FilterRegionSkeleton,
} from '@/features/country';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="w-full max-w-7xl mx-auto mb-8 px-5 mt-8 space-y-8 md:mt-12 md:space-y-12">
      <section className="flex max-md:flex-col justify-between gap-10">
        <Suspense
          fallback={
            <>
              <SearchInputSkeleton />
              <FilterRegionSkeleton />
            </>
          }
        >
          <SearchInput />
          <FilterRegion />
        </Suspense>
      </section>

      {children}
    </main>
  );
}
