import { Suspense } from 'react';
import { SearchInput, FilterRegion, CountryList } from '@/features/country';

type HomeProps = {
  searchParams: Promise<{ search?: string; region?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { search, region } = await searchParams;

  return (
    <main className="max-w-7xl mx-auto mb-8 px-5 mt-8 space-y-8 md:mt-12 md:space-y-12">
      <section className="flex max-md:flex-col justify-between gap-10">
        <SearchInput />
        <FilterRegion />
      </section>

      {/* TODO add skeleton loading */}
      <Suspense fallback={<p className="text-2xl text-center">Loading...</p>}>
        <CountryList search={search} region={region} />
      </Suspense>
    </main>
  );
}
