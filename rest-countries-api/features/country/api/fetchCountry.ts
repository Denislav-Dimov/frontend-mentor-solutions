import { Country } from '../types/country.type';
import { cacheLife } from 'next/cache';

export default async function fetchCountry(name: string) {
  'use cache';

  cacheLife('days');

  const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`);

  const data = await res.json();

  return data[0] as Country;
}
