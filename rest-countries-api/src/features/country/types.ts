import { z } from 'zod';
import { countryDetailsSchema, countrySchema } from './api/schemas/countrySchema';

export type Country = z.infer<typeof countrySchema>;
export type CountryDetails = z.infer<typeof countryDetailsSchema>;
