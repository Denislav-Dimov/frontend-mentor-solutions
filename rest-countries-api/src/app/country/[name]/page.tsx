import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { type Metadata } from 'next';
import { fetchCountry, fetchCountries } from '@/features/country';
import BackButton from '@/components/BackButton';
import fetchBorderCountries from '@/features/country/api/fetchBorderCountries';
import formatNumber from '@/utils/formatNumber';

type CountryPageProps = {
  params: Promise<{ name: string }>;
};

export async function generateStaticParams() {
  const countries = await fetchCountries();
  
  return countries.map(country => ({
    name: country.names.common,
  }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { name } = await params;
  const country = await fetchCountry(name);

  if (!country) {
    return { title: 'Country not found' };
  }

  return {
    title: country.names.common,
    description: `Population, capital, region, languages, currencies, and border information for ${country.names.common}.`,
  };
}

export default async function Country({ params }: CountryPageProps) {
  const { name } = await params;

  const country = await fetchCountry(name);

  if (!country) {
    notFound();
  }

  const borders = await fetchBorderCountries(country.borders ?? []);
  const nativeName = Object.values(country.names.native ?? {})[0]?.common ?? 'N/A';
  const currencies = country.currencies?.map(currency => currency.name).join(', ') || 'N/A';
  const languages = country.languages?.map(language => language.name).join(', ') || 'N/A';

  return (
    <section className="w-full max-w-7xl mx-auto px-5 my-12 md:my-20">
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-40 place-items-center mt-12 lg:mt-20">
        <div className="w-full max-w-2xl shadow-lg overflow-hidden">
          {country.flag.url_png ? (
            <Image
              src={country.flag.url_png}
              alt={country.flag.description ?? `Flag of ${country.names.common}`}
              width={500}
              height={500}
              priority
              loading='eager'
              className="w-full h-auto max-h-96 object-fill"
            />
          ) : (
            <div className="flex min-h-64 items-center justify-center bg-light-grey-400/10 text-light-grey-400 dark:text-white/80">
              Flag unavailable
            </div>
          )}
        </div>

        <div className="w-full text-light-grey-950 dark:text-white">
          <h1 className="text-3xl font-bold mb-8">{country.names.common}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <ul className="flex flex-col gap-2">
              <li>
                Native Name:{' '}
                <span className="font-light">{nativeName}</span>
              </li>
              <li>
                Population:{' '}
                <span className="font-light">
                  {country.population === null ? 'N/A' : formatNumber(country.population)}
                </span>
              </li>
              <li>
                Region: <span className="font-light">{country.region ?? 'N/A'}</span>
              </li>
              <li>
                Sub Region:{' '}
                <span className="font-light">{country.subregion ?? 'N/A'}</span>
              </li>
              <li>
                Capital:{' '}
                <span className="font-light">{country.capitals?.[0]?.name ?? 'N/A'}</span>
              </li>
            </ul>

            <ul className="flex flex-col gap-2">
              <li>
                Top Level Domain:{' '}
                <span className="font-light">{country.tlds?.[0] ?? 'N/A'}</span>
              </li>
              <li>
                Currencies: <span className="font-light">{currencies}</span>
              </li>
              <li>
                Languages: <span className="font-light">{languages}</span>
              </li>
            </ul>
          </div>

          {borders.length > 0 && (
            <div className="flex flex-col md:flex-row gap-4 md:items-start">
              <h3 className="text-base font-normal whitespace-nowrap py-1">
                Border Countries:
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {borders.map(border => (
                  <Link
                    href={`/country/${border.names.common}`}
                    key={border.codes.alpha_3 || border.names.common}
                    className="bg-white dark:bg-dark-blue-900 text-light-grey-950 dark:text-white shadow px-6 py-1 rounded text-sm font-light hover:shadow-lg transition-all min-w-24 text-center"
                  >
                    {border.names.common}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
