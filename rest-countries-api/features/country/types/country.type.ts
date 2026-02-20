export type Country = {
  name: {
    common: string;
  };
  capital?: string[];
  region: string;
  flags: {
    png: string;
    svg?: string;
    alt?: string;
  };
  population: number;
  cca3: string;
};

export type CountryDetails = Country & {
  name: {
    common: string;
    nativeName?: Record<string, { common: string }>;
  };
  subregion?: string;
  tld?: string[];
  currencies?: Record<string, { name: string }>;
  languages?: Record<string, string>;
  borders?: string[];
};
