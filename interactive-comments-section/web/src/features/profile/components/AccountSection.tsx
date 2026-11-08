'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { apiMutation, resetAntiforgeryToken } from '@/features/shared';

export default function AccountSection() {
  const router = useRouter();
  const headingId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function logOut() {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await apiMutation('/api/users/logout', { method: 'POST' });
      resetAntiforgeryToken();
      router.push('/login');
      router.refresh();
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : 'Something went wrong. Check your connection and try again.',
      );
      setPending(false);
    }
  }

  return (
    <section aria-labelledby={headingId} className="card grid gap-4">
      <div className="grid gap-1">
        <h2 id={headingId} className="text-grey-800 text-lg font-bold">
          Account
        </h2>
        <p className="text-grey-500 text-sm">Log out of your account on this device.</p>
      </div>
      <button
        type="button"
        onClick={logOut}
        disabled={pending}
        className="button-secondary justify-self-start"
      >
        {pending ? 'Logging out…' : 'Log out'}
      </button>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </section>
  );
}
