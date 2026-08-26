import { LocationCoords } from '../types';

export default function getBrowserCoordinates(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      err => reject(err),
      { timeout: 8000, maximumAge: 300_000 },
    );
  });
}
