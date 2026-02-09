import { fetchCountries, CountryCard } from '@/features/country';

type HomeProps = {
  searchParams: Promise<{ search?: string; region?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { search, region } = await searchParams;

  const countries = await fetchCountries(search, region);

  if (countries.length === 0) {
    return <p className="text-2xl text-center">No countries found</p>;
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center gap-8 md:gap-16 animate-fade-in">
      {countries.map(country => (
        <CountryCard {...country} key={country.name.common} />
      ))}
    </section>
  );
}
