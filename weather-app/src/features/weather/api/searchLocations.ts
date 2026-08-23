import { locationSearchResponseSchema } from './schemas/locationSearchSchema';

const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

type SearchLocationsOptions = {
  query: string;
  signal?: AbortSignal;
};

export async function searchLocations({ query, signal }: SearchLocationsOptions) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  const url =
    `${OPEN_METEO_GEOCODING_URL}?` +
    `name=${encodeURIComponent(normalizedQuery)}` +
    '&count=4&language=en&format=json';
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error('Failed to search for locations');
  }

  const data: unknown = await response.json();
  const parsedData = locationSearchResponseSchema.parse(data);

  return parsedData.results ?? [];
}
