import { fetchAllCountries } from './fetchCountries';

export default async function fetchBorderCountries(codes?: string[]) {
  if (!codes?.length) return [];

  const countries = await fetchAllCountries();
  const countriesByCode = new Map(
    countries.map(country => [country.codes.alpha_3, country]),
  );

  return codes.flatMap(code => {
    const country = countriesByCode.get(code);
    return country ? [country] : [];
  });
}
