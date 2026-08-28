import { fetchAllCountries } from './fetchCountries';

export default async function fetchCountry(name: string) {
  const countries = await fetchAllCountries();
  const normalizedName = name.toLocaleLowerCase();

  return (
    countries.find(
      country => country.names.common.toLocaleLowerCase() === normalizedName,
    ) ?? null
  );
}
