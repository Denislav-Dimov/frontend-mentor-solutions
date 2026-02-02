import fetchCountry from '../api/fetchCountry';

type CountryDetailsProps = {
  name: string;
};

export default async function CountryDetailsPage({ name }: CountryDetailsProps) {
  const country = await fetchCountry(name);

  return (
    <div className="text-center mt-12">
      <h2>{country.name.common}</h2>
      <p>{country.capital}</p>
    </div>
  );
}
