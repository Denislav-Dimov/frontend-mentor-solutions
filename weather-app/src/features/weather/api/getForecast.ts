import { Forecast, LocationCoords, Unit } from '../types';
import { getQueryParamsFromUnit } from '../lib/utils';
import { forecastSchema } from './schemas/forecastSchema';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

type GetForecastOptions = LocationCoords & {
  unit: Unit;
  signal?: AbortSignal;
};

export async function getForecast({
  latitude,
  longitude,
  unit,
  signal,
}: GetForecastOptions): Promise<Forecast> {
  const response = await fetch(
    `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation,weather_code' +
      '&hourly=temperature_2m,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
      '&timezone=auto&forecast_days=7' +
      getQueryParamsFromUnit(unit),
    { signal },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data: unknown = await response.json();

  return forecastSchema.parse(data);
}
