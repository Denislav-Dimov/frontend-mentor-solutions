export type Country = {
  name: {
    common: string;
  };
  capital: string;
  region: string;
  flags: {
    png: string;
    alt?: string;
  };
  population: number;
};

export type CountryDetails = Country & {
  // TODO add CountryDetails types
};
