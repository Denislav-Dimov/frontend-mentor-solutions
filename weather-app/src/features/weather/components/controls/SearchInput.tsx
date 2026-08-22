'use client';

import Image from 'next/image';
import { useRef } from 'react';

export function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    const value = inputRef.current?.value.trim();

    if (!value) {
      return;
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-5 text-xl sm:flex-row">
      <section className="flex w-full items-center gap-3 rounded-xl bg-neutral-800 px-6 py-4">
        <Image
          src="/assets/images/icon-search.svg"
          alt=""
          width={25}
          height={25}
          className="size-5"
        />

        <input
          type="text"
          aria-label="Search for a place"
          placeholder="Search for a place..."
          className="w-full outline-0 placeholder:text-neutral-200"
          ref={inputRef}
        />
      </section>

      <button
        onClick={handleClick}
        className="cursor-pointer rounded-xl bg-blue-500 px-6 py-4 transition hover:bg-blue-700"
      >
        Search
      </button>
    </section>
  );
}
