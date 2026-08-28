import { z } from 'zod';
import { countryDetailsSchema } from './countrySchema';

export const restCountriesErrorResponseSchema = z.object({
  errors: z.array(
    z.object({
      message: z.string(),
    }),
  ),
});

export const countriesResponseSchema = z.object({
  data: z.object({
    objects: z.array(countryDetailsSchema),
    meta: z.object({
      total: z.number().int().nonnegative(),
    }),
  }),
});
