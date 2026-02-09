import { Country } from '../types/country.type';

export default async function fetchCountry(name: string) {
  const res = await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`, {
    next: { revalidate: 3600 },
  });

  const data = await res.json();

  return data[0] as Country;
}
