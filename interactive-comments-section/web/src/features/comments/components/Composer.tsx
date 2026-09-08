'use client';

import { useState } from 'react';

type ComposerProps = {
  avatarSrc: string;
  avatarAlt: string;
  buttonLabel: string;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  onSubmit: (value: string) => void;
};

export default function Composer({
  avatarSrc,
  avatarAlt,
  buttonLabel,
  placeholder = 'Add a comment...',
  initialValue = '',
  autoFocus = false,
  onSubmit,
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      className="grid w-full grid-cols-2 items-center gap-4 rounded-lg bg-white p-4 md:flex md:items-start md:gap-4 md:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setValue('');
      }}
    >
      <img
        src={avatarSrc}
        alt={avatarAlt}
        className="order-2 h-[2.125rem] w-[2.125rem] rounded-full md:order-1"
      />
      <label htmlFor={`composer-${buttonLabel}`} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={`composer-${buttonLabel}`}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="order-1 col-span-2 h-24 w-full resize-none rounded-xl border-2 border-grey-100 px-5 py-2 font-normal text-grey-800 placeholder:text-grey-500/60 focus:outline-2 focus:outline-purple-600 md:order-2 md:flex-1"
      />
      <button
        type="submit"
        className="order-3 w-fit cursor-pointer justify-self-end rounded-[5px] border-none bg-purple-600 px-6 py-2.5 text-sm font-medium uppercase text-white transition-opacity duration-200 hover:opacity-50 md:justify-self-auto"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
