import { z } from 'zod';

export const locationSearchResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
});

export const locationSearchResponseSchema = z.object({
  results: z.array(locationSearchResultSchema).optional(),
});

export type LocationSearchResult = z.infer<typeof locationSearchResultSchema>;
