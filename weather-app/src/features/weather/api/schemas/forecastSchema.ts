import { z } from 'zod';
import { wmoWeatherCodeSchema } from './wmoWeatherCodeSchema';

export const forecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    wind_speed_10m: z.number(),
    precipitation: z.number(),
    weather_code: wmoWeatherCodeSchema,
    apparent_temperature: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    weather_code: z.array(wmoWeatherCodeSchema),
  }),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(wmoWeatherCodeSchema),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
  }),
});

export type Forecast = z.infer<typeof forecastSchema>;
