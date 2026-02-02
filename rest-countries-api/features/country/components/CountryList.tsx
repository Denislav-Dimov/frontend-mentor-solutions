import fetchCountries from '../api/fetchCountries';
import CountryCard from './CountryCard';

type CountryListProps = {
  search?: string;
  region?: string;
};

export default async function CountryList({ search, region }: CountryListProps) {
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
