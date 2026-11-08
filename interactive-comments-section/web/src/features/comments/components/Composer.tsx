'use client';

import { useEffect, useId, useRef, useState } from 'react';
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

const submitClass =
  'button-primary order-3 min-w-26 justify-self-end uppercase md:justify-self-auto';

export default function Composer({
  avatarSrc,
  avatarAlt,
  buttonLabel,
  placeholder = 'Add a comment…',
  initialValue = '',
  autoFocus = false,
  toggleReply,
  onSubmit,
  isGuest = false,
}: ComposerProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const isReply = buttonLabel === 'Reply';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (autoFocus && textarea) {
      const length = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(length, length);
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
      className="card grid grid-cols-2 items-center gap-4 p-4 md:flex md:items-start md:gap-4 md:p-6"
      onSubmit={e => {
        e.preventDefault();
        submitValue();
      }}
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={avatarAlt}
          width={40}
          height={40}
          unoptimized
          className="order-2 size-8 rounded-full object-cover md:order-1 md:size-10"
        />
      ) : (
        <span
          aria-hidden="true"
          className="bg-grey-100 text-grey-500 order-2 grid size-8 shrink-0 place-items-center rounded-full font-bold md:order-1 md:size-10"
        >
          {avatarAlt.charAt(0).toUpperCase()}
        </span>
      )}
      <label htmlFor={textareaId} className="sr-only">
        {isReply ? 'Write a reply' : 'Add a comment'}
      </label>
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={value}
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
        className="input order-1 col-span-2 h-24 resize-none md:order-2 md:flex-1"
      />
      {isGuest ? (
        <GuestPrompt
          action={isReply ? 'reply to comments' : 'publish comments'}
          className={submitClass}
        >
          {buttonLabel}
        </GuestPrompt>
      ) : (
        <button type="submit" className={submitClass}>
          {buttonLabel}
        </button>
      )}
    </form>
  );
}
