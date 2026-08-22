export type Unit = 'metric' | 'imperial';

export type LocationCoords = { latitude: number; longitude: number };

export type Location = LocationCoords & {
  country: string;
  city: string;
};

export type { Forecast } from './api/schemas/forecastSchema';

export type { WmoWeatherCode } from './api/schemas/wmoWeatherCodeSchema';
