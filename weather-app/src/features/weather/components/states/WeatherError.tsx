'use client';

import Image from 'next/image';

type Props = {
  onRetry: () => void;
};

export function WeatherError({ onRetry }: Props) {
  return (
    <section className="mt-16 flex flex-col items-center justify-center gap-6 pt-10 text-center">
      <Image src="/assets/images/icon-error.svg" alt="" width={48} height={48} />
      <h2 className="font-family-secondary text-[3.25rem]">Something went wrong</h2>
      <p className="max-w-lg text-xl text-neutral-200">
        We couldn’t connect to the server (API error). Please try again in a few moments.
      </p>
      <button
        onClick={onRetry}
        className="flex cursor-pointer gap-2.5 rounded-lg bg-neutral-800 px-4 py-3 text-base transition hover:bg-neutral-700"
      >
        <Image src="/assets/images/icon-retry.svg" alt="" width={18} height={18} />
        Retry
      </button>
    </section>
  );
}
