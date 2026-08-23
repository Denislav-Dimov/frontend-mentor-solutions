'use client';

import Image from 'next/image';
import { useRef } from 'react';
import type { LocationSearchState } from '../../hooks/useLocationSearch';
import type { LocationSearchResult } from '../../types';

type Props = {
  query: string;
  state: LocationSearchState;
  onQueryChange: (query: string) => void;
  onSubmit: () => Promise<void>;
  onSelect: (result: LocationSearchResult) => void;
};

function getLocationDetails(result: LocationSearchResult) {
  return [result.admin1, result.country]
    .filter((value): value is string => typeof value === 'string' && value !== result.name)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(', ');
}

export function SearchInput({ query, state, onQueryChange, onSubmit, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      className="mx-auto w-full max-w-2xl text-xl"
      onSubmit={e => {
        e.preventDefault();
        void onSubmit();
      }}
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="relative w-full">
          <div className="focus-within:outline-neutral-0 flex w-full items-center gap-3 rounded-xl bg-neutral-800 px-6 py-4 focus-within:outline-2 focus-within:outline-offset-2">
            <Image
              src="/assets/images/icon-search.svg"
              alt=""
              width={25}
              height={25}
              className="size-5"
            />

            <label className="sr-only" htmlFor="location-search">
              Search for a place
            </label>
            <input
              id="location-search"
              type="text"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder="Search for a place..."
              autoComplete="off"
              minLength={2}
              required
              ref={inputRef}
              aria-invalid={state.status === 'error' ? true : undefined}
              className="w-full outline-0 placeholder:text-neutral-200"
            />
          </div>

          {state.status === 'searching' && (
            <div className="mt-3 flex w-full items-center gap-3 rounded-xl bg-neutral-800 px-4 py-3 text-base sm:absolute sm:top-full sm:left-0 sm:z-40">
              <Image
                src="/assets/images/icon-loading.svg"
                alt=""
                width={20}
                height={20}
                className="size-5 animate-spin"
              />
              Search in progress
            </div>
          )}

          {state.status === 'results' && (
            <>
              <p className="sr-only" role="status" aria-live="polite">
                {state.results.length} location results found.
              </p>
              <ul className="mt-3 w-full space-y-1 rounded-xl bg-neutral-800 p-2 sm:absolute sm:top-full sm:left-0 sm:z-40">
                {state.results.map(result => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(result);
                        inputRef.current?.focus();
                      }}
                      className="focus-visible:outline-neutral-0 w-full cursor-pointer rounded-lg px-2 py-2.5 text-left text-base transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      <span className="block">{result.name}</span>
                      {getLocationDetails(result) && (
                        <span className="block text-sm text-neutral-300">
                          {getLocationDetails(result)}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {state.status === 'error' && (
            <p
              role="alert"
              className="mt-3 w-full rounded-xl bg-neutral-800 px-4 py-3 text-base sm:absolute sm:top-full sm:left-0 sm:z-40"
            >
              We couldn’t search for locations. Please try again.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="focus-visible:outline-neutral-0 cursor-pointer rounded-xl bg-blue-500 px-6 py-4 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Search
        </button>
      </div>

      {state.status === 'empty' && (
        <p role="status" className="mt-12 text-center text-[1.75rem] font-bold">
          No search result found!
        </p>
      )}
    </form>
  );
}
