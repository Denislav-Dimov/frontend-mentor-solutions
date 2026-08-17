import { DAYS_OF_THE_WEEK } from "./constants";

export type Unit = 'metric' | 'imperial';

export type LocationCoords = { latitude: number; longitude: number };

export type Location = LocationCoords & {
  country: string;
  city: string;
};

export type Day = (typeof DAYS_OF_THE_WEEK)[number];
