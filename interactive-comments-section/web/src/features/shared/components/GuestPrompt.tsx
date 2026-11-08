'use client';

import Link from 'next/link';
import { useId, useRef, useState, type ReactNode } from 'react';
import Modal from './Modal';

type GuestDialogProps = {
  action: string;
  open: boolean;
  onClose: () => void;
};

export function GuestDialog({ action, open, onClose }: GuestDialogProps) {
  if (!open) return null;
  return <GuestDialogContent action={action} onClose={onClose} />;
}

function GuestDialogContent({ action, onClose }: Omit<GuestDialogProps, 'open'>) {
  const titleId = useId();
  const descriptionId = useId();
  const dismissRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      initialFocusRef={dismissRef}
    >
      <h2 id={titleId} className="text-grey-800 text-xl font-medium md:text-2xl">
        Create an account to {action}
      </h2>
      <p id={descriptionId} className="mt-4">
        Register or log in to keep your comments, replies and activity connected to you.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/register" className="button-primary">
          Register
        </Link>
        <Link href="/login" className="button-secondary">
          Log in
        </Link>
      </div>
      <button
        ref={dismissRef}
        type="button"
        onClick={onClose}
        className="link mx-auto mt-4 block text-sm"
      >
        Not now
      </button>
    </Modal>
  );
}

type GuestPromptProps = {
  action: string;
  children: ReactNode;
  className?: string;
};

export default function GuestPrompt({
  action,
  children,
  className = 'link',
}: GuestPromptProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <GuestDialog action={action} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
