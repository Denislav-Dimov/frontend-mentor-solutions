import { type Country, fetchCountry } from '@/features/country';

type CountryProps = {
  params: Promise<{ name: string }>;
};

export default async function Country({ params }: CountryProps) {
  const { name } = await params;

  const country: Country = await fetchCountry(name);

  return (
    <div className="text-center mt-12">
      <h2>{country.name.common}</h2>
      <p>{country.capital}</p>
    </div>
  );
}
