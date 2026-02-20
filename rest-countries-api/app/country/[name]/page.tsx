import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCountry, fetchCountries } from '@/features/country';
import BackButton from '@/components/BackButton';
import fetchBorderCountries from '@/features/country/api/fetchBorderCountries';
import formatNumber from '@/utils/formatNumber';

export async function generateStaticParams() {
  const countries = await fetchCountries();
  
  return countries.map(country => ({
    name: country.name.common,
  }));
}

export default async function Country({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const country = await fetchCountry(name);

  if (!country) notFound();

  const borders = await fetchBorderCountries(country.borders);
  const nativeName = Object.values(country.name.nativeName ?? {})[0]?.common ?? 'N/A';
  const currencies = Object.values(country.currencies ?? {})[0]?.name ?? 'N/A';
  const languages = Object.values(country.languages ?? {}).join(', ') || 'N/A';

  return (
    <section className="w-full max-w-7xl mx-auto px-5 my-12 md:my-20">
      <BackButton />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-40 place-items-center mt-12 lg:mt-20">
        <div className="w-full max-w-2xl shadow-lg overflow-hidden">
          <Image
            src={country.flags.svg || country.flags.png}
            alt={country.flags.alt ?? `Flag of ${country.name.common}`}
            width={500}
            height={500}
            priority
            className="w-full h-auto max-h-96 object-fill"
          />
        </div>

        <div className="w-full text-light-grey-950 dark:text-white">
          <h1 className="text-3xl font-bold mb-8">{country.name.common}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <ul className="flex flex-col gap-2">
              <li>
                Native Name: <span className="font-light">{nativeName}</span>
              </li>
              <li>
                Population:{' '}
                <span className="font-light">{formatNumber(country.population)}</span>
              </li>
              <li>
                Region: <span className="font-light">{country.region}</span>
              </li>
              <li>
                Sub Region: <span className="font-light">{country.subregion}</span>
              </li>
              <li>
                Capital:{' '}
                <span className="font-light">{country.capital?.[0] ?? 'N/A'}</span>
              </li>
            </ul>

            <ul className="flex flex-col gap-2">
              <li>
                Top Level Domain:{' '}
                <span className="font-light">{country.tld?.[0] ?? 'N/A'}</span>
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
                    href={`/country/${border.name.common}`}
                    key={border.cca3}
                    className="bg-white dark:bg-dark-blue-900 text-light-grey-950 dark:text-white shadow px-6 py-1 rounded text-sm font-light hover:shadow-lg transition-all min-w-24 text-center"
                  >
                    {border.name.common}
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
