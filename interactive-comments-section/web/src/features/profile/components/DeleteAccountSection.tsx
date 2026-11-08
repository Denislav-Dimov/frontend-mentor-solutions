'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import {
  ApiRequestError,
  ConfirmDialog,
  apiMutation,
  resetAntiforgeryToken,
  useToast,
} from '@/features/shared';
import { firstFieldError } from '../lib/field-errors';

export default function DeleteAccountSection() {
  const router = useRouter();
  const notify = useToast();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);

  function close() {
    if (pending) return;
    setOpen(false);
    setPassword('');
    setPasswordError('');
    setFormError('');
  }

  async function deleteAccount() {
    if (!password || pending) return;
    setPending(true);
    setPasswordError('');
    setFormError('');
    try {
      await apiMutation('/api/users/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      resetAntiforgeryToken();
      notify('Your account was deleted.');
      router.push('/');
      router.refresh();
    } catch (error) {
      const fieldMessage =
        error instanceof ApiRequestError
          ? firstFieldError(error.fieldErrors, 'password')
          : undefined;
      if (fieldMessage) setPasswordError(fieldMessage);
      else
        setFormError(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Check your connection and try again.',
        );
      setPending(false);
    }
  }

  const headingId = `${id}-heading`;
  const passwordId = `${id}-password`;
  const passwordErrorId = `${id}-password-error`;

  return (
    <section aria-labelledby={headingId} className="card grid gap-4 border-2 border-pink-200">
      <div className="grid gap-1">
        <h2 id={headingId} className="text-lg font-bold text-pink-400">
          Delete account
        </h2>
        <p className="text-grey-500 text-sm">
          Permanently remove your profile, comments, replies, and votes. This can’t be undone.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="button-danger justify-self-start"
      >
        Delete account
      </button>

      {open && (
        <ConfirmDialog
          textFields={{
            action: 'Delete account',
            additional:
              'This permanently removes your profile, comments, replies, and votes. Enter your password to confirm.',
            confirm: pending ? 'Deleting…' : 'Yes, delete',
            cancel: 'No, cancel',
          }}
          onCancel={close}
          onConfirm={deleteAccount}
          pending={pending}
          confirmDisabled={!password}
        >
          <div className="grid gap-2">
            <label htmlFor={passwordId} className="field-label">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              disabled={pending}
              onChange={event => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError('');
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void deleteAccount();
                }
              }}
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? passwordErrorId : undefined}
              className="input"
            />
            {passwordError && (
              <p id={passwordErrorId} role="alert" className="field-error">
                {passwordError}
              </p>
            )}
            {formError && (
              <p role="alert" className="field-error">
                {formError}
              </p>
            )}
          </div>
        </ConfirmDialog>
      )}
    </section>
  );
}
