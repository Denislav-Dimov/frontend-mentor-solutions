import { Location, Unit } from './types';

export const UNITS_LC_KEY = 'Weather App - Unit';

export const DEFAULT_UNIT: Partial<Unit> = 'metric';

export const DEFAULT_LOCATION: Location = {
  country: 'Germany',
  city: 'Berlin',
  latitude: 52.52,
  longitude: 13.41,
};

export const DAYS_OF_THE_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
