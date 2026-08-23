import { LocationCoords } from '../types';
import { reverseGeocodeSchema, ReverseGeocodeResult } from './schemas/reverseGeocodeSchema';

export default async function reverseGeocode({
  latitude,
  longitude,
}: LocationCoords): Promise<ReverseGeocodeResult> {
  const url = `https://api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Failed to reverse-geocode coordinates');
  }

  const data: unknown = await res.json();

  return reverseGeocodeSchema.parse(data);
}
