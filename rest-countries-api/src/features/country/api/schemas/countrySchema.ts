import { z } from 'zod';

export const countrySchema = z.object({
  names: z.object({
    common: z.string(),
  }),
  codes: z.object({
    alpha_3: z.string(),
  }),
  capitals: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .nullable()
    .optional(),
  region: z.string().nullable(),
  flag: z.object({
    url_png: z.union([z.url(), z.literal('')]),
    description: z.string().nullable().optional(),
  }),
  population: z.number().nonnegative().nullable(),
});

export const countryDetailsSchema = countrySchema.extend({
  names: z.object({
    common: z.string(),
    native: z
      .record(
        z.string(),
        z.object({
          common: z.string(),
          official: z.string().nullable().optional(),
        }),
      )
      .nullable()
      .optional(),
  }),
  subregion: z.string().nullable(),
  tlds: z.array(z.string()).nullable().optional(),
  currencies: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .nullable()
    .optional(),
  languages: z
    .array(
      z.object({
        name: z.string(),
      }),
    )
    .nullable()
    .optional(),
  borders: z.array(z.string()).nullable().optional(),
});
