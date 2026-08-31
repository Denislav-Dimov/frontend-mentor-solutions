import { z } from 'zod';

export const reverseGeocodeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  countryName: z.string(),
  city: z.string(),
  locality: z.string(),
});

export type ReverseGeocodeResult = z.infer<typeof reverseGeocodeSchema>;
