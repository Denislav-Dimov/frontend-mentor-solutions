import { LocationCoords } from '../types';
import { reverseGeocodeSchema } from './schemas/reverseGeocodeSchema';

type ReverseGeocodeOptions = LocationCoords & {
  signal?: AbortSignal;
};

export default async function reverseGeocode({
  latitude,
  longitude,
  signal,
}: ReverseGeocodeOptions) {
  const response = await fetch(
    `https://api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error('Failed to reverse-geocode coordinates');
  }

  const data: unknown = await response.json();

  return reverseGeocodeSchema.parse(data);
}
