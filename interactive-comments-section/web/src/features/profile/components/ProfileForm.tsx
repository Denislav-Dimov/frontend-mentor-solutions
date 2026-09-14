'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { profileSchema } from '../schemas';
import { ConfirmDialog } from '@/features/shared';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5217';

async function antiforgeryToken() {
  const response = await fetch(`${apiUrl}/api/security/antiforgery`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Unable to prepare this request.');
  }
  return (await response.json()).token as string;
}

type Props = {
  user: {
    username: string;
    avatarUrl: string;
  };
};

export default function ProfileForm({ user }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  async function updateProfile(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const parsed = profileSchema.safeParse({ username });
    if (!parsed.success) {
      return setError(parsed.error.issues[0]?.message ?? 'Invalid name.');
    }

    setPending(true);
    try {
      const token = await antiforgeryToken();
      const response = await fetch(`${apiUrl}/api/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) throw new Error('The name could not be updated.');
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : 'Unable to update profile.',
      );
    } finally {
      setPending(false);
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPending(true);
    try {
      const token = await antiforgeryToken();
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${apiUrl}/api/users/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-XSRF-TOKEN': token },
        body,
      });
      if (!response.ok) {
        throw new Error('The profile picture could not be uploaded.');
      }
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : 'Unable to upload picture.',
      );
    } finally {
      setPending(false);
    }
  }

  async function accountAction(action: 'logout' | 'delete') {
    setPending(true);
    try {
      const token = await antiforgeryToken();
      const response = await fetch(
        `${apiUrl}/api/users/${action === 'delete' ? 'me' : 'logout'}`,
        {
          method: action === 'delete' ? 'DELETE' : 'POST',
          credentials: 'include',
          headers: { 'X-XSRF-TOKEN': token },
        },
      );
      if (!response.ok) {
        throw new Error('The request could not be completed.');
      }
      router.push('/login');
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : 'Unable to complete request.',
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="grid gap-8">
        <form onSubmit={updateProfile} className="grid gap-7 rounded-lg bg-white p-7 md:p-9">
          <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Image
              src={user.avatarUrl}
              alt=""
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
            <label className="grid w-full min-w-0 gap-2 text-sm font-bold text-purple-600 sm:flex-1">
              <span>Change picture</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={uploadAvatar}
                className="text-grey-500 block w-full min-w-0 max-w-full overflow-hidden rounded-lg border-2 border-dashed border-purple-200 p-2 text-xs"
              />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold">
            Username
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              className="input"
            />
          </label>
          <button disabled={pending} className="button-primary justify-self-start">
            Save changes
          </button>
        </form>
        {error && (
          <p className="text-sm text-pink-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowLogoutDialog(true)}
          className="button-secondary w-full rounded-lg bg-white p-2.5"
        >
          Log out
        </button>
        <section className="rounded-lg border-2 border-pink-200 bg-pink-200/30 p-6">
          <h2 className="text-grey-800 font-bold">Delete account</h2>
          <p className="text-grey-500 mt-1 text-sm">
            This permanently removes your profile, comments, and reactions.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="mt-5 rounded-lg bg-pink-400 px-5 py-3 font-bold text-white transition-opacity hover:opacity-80"
          >
            Delete my account
          </button>
        </section>
      </div>

      {showLogoutDialog && !showDeleteDialog && (
        <ConfirmDialog
          textFields={{
            action: 'Log out',
            additional: 'Are you sure you want to log out of this account?',
            confirm: 'Yes, log out',
            cancel: 'No, cancel',
          }}
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={() => accountAction('logout')}
        />
      )}

      {showDeleteDialog && !showLogoutDialog && (
        <ConfirmDialog
          textFields={{
            action: 'Delete account',
            additional:
              'Are you sure you want to delete this account? This will permanently remove your profile, comments, and reactions.',
            confirm: 'Yes, delete',
            cancel: 'No, cancel',
          }}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={() => accountAction('delete')}
        />
      )}
    </>
  );
}
