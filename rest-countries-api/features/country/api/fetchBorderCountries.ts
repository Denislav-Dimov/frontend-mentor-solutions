import { cacheLife } from 'next/cache';
import { CountryDetails } from '../types/country.type';

export default async function fetchBorderCountries(codes?: string[]) {
  'use cache';

  cacheLife('days');

  if (!codes || codes.length === 0) return [];

  const res = await fetch(
    `https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}&fields=cca3,name`,
  );

  const borders = await res.json();

  return borders as Array<Pick<CountryDetails, 'cca3' | 'name'>>;
}
