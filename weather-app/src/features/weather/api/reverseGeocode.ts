import { LocationCoords } from '../types';

export default async function reverseGeocode({ latitude, longitude }: LocationCoords) {
  const url = `https://api-bdc.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error('Failed to reverse-geocode coordinates');
    }

    return await res.json();
  } catch (err) {
    console.error(err);
  }
}
