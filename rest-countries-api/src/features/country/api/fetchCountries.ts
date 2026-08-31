import { cacheLife } from 'next/cache';
import {
  countriesResponseSchema,
  restCountriesErrorResponseSchema,
} from './schemas/restCountriesResponseSchema';

const API_URL = 'https://api.restcountries.com/countries/v5';
const API_KEY = process.env.REST_COUNTRIES_API_KEY;
const PAGE_SIZE = 100;

const COUNTRY_FIELDS = [
  'names.common',
  'names.native',
  'codes.alpha_3',
  'capitals',
  'region',
  'subregion',
  'flag.url_png',
  'flag.description',
  'population',
  'tlds',
  'currencies',
  'languages',
  'borders',
].join(',');

type QueryParams = Record<string, string | number | undefined>;

async function fetchCountriesPage(path: string, params: QueryParams) {
  if (!API_KEY) {
    throw new Error('REST_COUNTRIES_API_KEY is not configured.');
  }

  const url = new URL(`${API_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: { Authorization: `${API_KEY}` },
    cache: 'force-cache',
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    const retryMessage = retryAfter ? ` Retry after ${retryAfter} seconds.` : '';

    throw new Error(`REST Countries rate limit exceeded.${retryMessage}`);
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch {
    throw new Error(`REST Countries returned invalid JSON (${response.status}).`);
  }

  const errorResponse = restCountriesErrorResponseSchema.safeParse(body);

  if (!response.ok || errorResponse.success) {
    const message = errorResponse.success
      ? errorResponse.data.errors.map(error => error.message).join(' ')
      : `REST Countries request failed with status ${response.status}.`;

    throw new Error(message);
  }

  const result = countriesResponseSchema.safeParse(body);

  if (!result.success) {
    throw new Error('REST Countries returned invalid country data.');
  }

  return result.data.data;
}

export async function fetchAllCountries() {
  'use cache';

  cacheLife('days');

  const query = {
    response_fields: COUNTRY_FIELDS,
  };
  const firstPage = await fetchCountriesPage('', {
    ...query,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const countries = [...firstPage.objects];

  for (let offset = PAGE_SIZE; offset < firstPage.meta.total; offset += PAGE_SIZE) {
    const page = await fetchCountriesPage('', {
      ...query,
      limit: PAGE_SIZE,
      offset,
    });

    countries.push(...page.objects);
  }

  return countries;
}

export default async function fetchCountries(search?: string, region?: string) {
  const countries = await fetchAllCountries();
  const normalizedSearch = search?.trim().toLocaleLowerCase();
  const normalizedRegion = region && region !== 'All' ? region : undefined;

  return countries.filter(country => {
    const matchesSearch =
      !normalizedSearch ||
      country.names.common.toLocaleLowerCase().includes(normalizedSearch);
    const matchesRegion = !normalizedRegion || country.region === normalizedRegion;

    return matchesSearch && matchesRegion;
  });
}
