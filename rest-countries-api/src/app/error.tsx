'use client';

import { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-20 text-center">
      <h1 className="text-3xl font-bold">Unable to load country data</h1>
      <p className="text-light-grey-400 dark:text-white/80">
        The country service may be temporarily unavailable. Try the request again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-white px-6 py-2 shadow transition-shadow hover:shadow-lg dark:bg-dark-blue-900"
      >
        Try again
      </button>
    </section>
  );
}
