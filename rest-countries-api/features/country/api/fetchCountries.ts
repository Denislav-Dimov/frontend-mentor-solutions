import { Country } from '../types/country.type';
import { cacheLife } from 'next/cache';

export default async function fetchCountries(search?: string, region?: string) {
  'use cache';

  cacheLife('days');

  const res = search
    ? await fetch(`https://restcountries.com/v3.1/name/${search}`)
    : await fetch(
        'https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital',
      );

  const data = await res.json();

  const countries: Country[] = Array.isArray(data) ? data : [];

  return region ? countries.filter(country => country.region === region) : countries;
}
