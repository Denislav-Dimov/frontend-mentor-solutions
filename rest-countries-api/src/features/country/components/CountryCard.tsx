import Image from 'next/image';
import Link from 'next/link';
import { type Country } from '../types';
import formatNumber from '@/utils/formatNumber';

export default function CountryCard({
  names,
  flag,
  population,
  region,
  capitals,
}: Country) {
  return (
    <Link
      href={`/country/${names.common}`}
      aria-label={`View details for ${names.common}`}
      className="group block max-w-70 w-full overflow-hidden rounded-md bg-white text-sm shadow transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hover:scale-[1.03] dark:bg-dark-blue-900 dark:focus-visible:ring-offset-dark-blue-900"
    >
      <div className="relative h-44 w-full overflow-hidden bg-light-grey-400/10">
        {flag.url_png ? (
          <Image
            src={flag.url_png}
            alt={flag.description ?? `Flag of ${names.common}`}
            fill
            loading="eager"
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-light-grey-400 dark:text-white/80">
            Flag unavailable
          </div>
        )}
      </div>

      <div className="p-7">
        <h2 className="mb-3 text-lg font-bold">{names.common}</h2>
        <p>
          Population:{' '}
          <span className="text-light-grey-400 dark:text-white/80">
            {population === null ? 'N/A' : formatNumber(population)}
          </span>
        </p>
        <p>
          Region:{' '}
          <span className="text-light-grey-400 dark:text-white/80">
            {region ?? 'N/A'}
          </span>
        </p>
        <p>
          Capital:{' '}
          <span className="text-light-grey-400 dark:text-white/80">
            {capitals?.[0]?.name ?? 'N/A'}
          </span>
        </p>
      </div>
    </Link>
  );
}
