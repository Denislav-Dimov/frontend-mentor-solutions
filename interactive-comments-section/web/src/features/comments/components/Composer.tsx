'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import GuestPrompt from '@/features/shared/components/GuestPrompt';

type ComposerProps = {
  avatarSrc: string | null;
  avatarAlt: string;
  buttonLabel: string;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  toggleReply?: () => void;
  onSubmit: (value: string) => void | Promise<void>;
  isGuest?: boolean;
};

export default function Composer({
  avatarSrc,
  avatarAlt,
  buttonLabel,
  placeholder = 'Add a comment...',
  initialValue = '',
  autoFocus = false,
  toggleReply,
  onSubmit,
  isGuest = false,
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus]);

  const submitValue = () => {
    const trimmed = value.trim();
    if (!trimmed || isGuest) {
      return;
    }
    void Promise.resolve(onSubmit(trimmed)).then(() => setValue(''));
  };

  return (
    <form
      className="grid w-full grid-cols-2 items-center gap-5 rounded-lg bg-white p-5 md:flex md:items-start md:gap-5 md:p-6"
      onSubmit={e => {
        e.preventDefault();
        submitValue();
      }}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          width={34}
          height={34}
          unoptimized
          className="order-2 h-8.5 w-8.5 rounded-full md:order-1"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-grey-100 text-grey-500 order-2 grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full font-bold md:order-1"
        >
          {avatarAlt.charAt(0).toUpperCase()}
        </span>
      )}
      <label htmlFor={`composer-${buttonLabel}`} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={`composer-${buttonLabel}`}
        ref={textareaRef}
        value={value}
        autoFocus={autoFocus}
        onChange={event => setValue(event.target.value)}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.preventDefault();
            toggleReply?.();
            setValue(initialValue);
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitValue();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="border-grey-100 text-grey-800 placeholder:text-grey-500/60 order-1 col-span-2 h-24 w-full resize-none rounded-xl border-2 px-5 py-2 font-normal focus:outline-2 focus:outline-purple-600 md:order-2 md:flex-1"
      />
      {isGuest ? (
        <GuestPrompt
          action={buttonLabel === 'Reply' ? 'reply to comments' : 'publish comments'}
        >
          <span className="order-3 w-fit rounded-[5px] bg-purple-600 px-6 py-2.5 text-sm font-medium text-white uppercase md:justify-self-auto">
            {buttonLabel}
          </span>
        </GuestPrompt>
      ) : (
        <button
          type="submit"
          className="order-3 w-fit justify-self-end rounded-[5px] border-none bg-purple-600 px-6 py-2.5 text-sm font-medium text-white uppercase transition-opacity duration-200 hover:opacity-50 md:justify-self-auto"
        >
          {buttonLabel}
        </button>
      )}
    </form>
  );
}
