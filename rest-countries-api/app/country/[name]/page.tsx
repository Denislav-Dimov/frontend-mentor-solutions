import { notFound } from 'next/navigation';
import { type Country, fetchCountry, fetchCountries } from '@/features/country';

type CountryProps = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  const countries = await fetchCountries();
  
  return countries.map(country => ({
    name: country.name.common,
  }));
}

export default async function Country({ params }: CountryProps) {
  const { name } = await params;

  const country: Country = await fetchCountry(name);

  if (!country) notFound();

  return (
    <div className="text-center mt-12">
      <h2>{country.name.common}</h2>
      <p>{country.capital}</p>
    </div>
  );
}
