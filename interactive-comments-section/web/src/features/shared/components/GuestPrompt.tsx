'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';

type Props = {
  action: string;
  children: React.ReactNode;
};

export function GuestDialog({
  action,
  open,
  onClose,
}: {
  action: string;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="grid w-full max-w-100 gap-4 rounded-lg bg-white p-8">
        <div>
          <h2 id={titleId} className="text-grey-800 text-xl font-medium">
            Create an account to {action}
          </h2>
          <p className="text-grey-500 mt-2 font-normal">
            Register or log in to keep your comments, replies, and activity connected to you.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Link
            href="/login"
            className="bg-grey-500 text-grey-50 w-full rounded-lg p-3 text-center text-sm font-medium uppercase transition-opacity hover:opacity-50"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-grey-50 w-full rounded-lg bg-purple-600 p-3 text-center text-sm font-medium uppercase transition-opacity hover:opacity-50"
          >
            Register
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="bg-grey-100 text-grey-800 w-full rounded-lg border-none p-3 text-sm font-medium uppercase transition-opacity hover:opacity-50"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuestPrompt({ action, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        {children}
      </button>
      <GuestDialog action={action} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
