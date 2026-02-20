import Image from 'next/image';
import { type Country } from '../types/country.type';
import formatNumber from '@/utils/formatNumber';
import Link from 'next/link';

export default function CountryCard({
  name,
  flags,
  population,
  region,
  capital,
}: Country) {
  return (
    <div className="max-w-70 w-full text-sm rounded-md overflow-hidden bg-white dark:bg-dark-blue-900 shadow cursor-pointer transition-all duration-300 md:hover:scale-[1.03]">
      <Link href={`/country/${name.common}`}>
        {/* FIXME add svg and fix its size */}
        <Image
          src={flags.png}
          alt={flags.alt ?? name.common}
          width={500}
          height={500}
          loading="lazy"
          className="w-full h-44 object-fill shadow"
        />
        <div className="p-7">
          <h2 className="font-bold text-lg mb-3">{name.common}</h2>
          <p>
            Population:{' '}
            <span className="text-light-grey-400 dark:text-white/80">
              {formatNumber(population)}
            </span>
          </p>
          <p>
            Region:{' '}
            <span className="text-light-grey-400 dark:text-white/80">{region}</span>
          </p>
          <p>
            Capital:{' '}
            <span className="text-light-grey-400 dark:text-white/80">
              {capital?.[0] ?? 'N/A'}
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}
