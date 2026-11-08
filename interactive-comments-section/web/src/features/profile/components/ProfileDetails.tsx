'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, SubmitEvent } from 'react';
import { ApiRequestError, apiMutation, useToast } from '@/features/shared';
import { firstFieldError } from '../lib/field-errors';
import { AVATAR_TYPES, profileSchema, validateAvatar } from '../schemas';

type Props = {
  user: {
    username: string;
    avatarUrl: string;
  };
};

const FALLBACK_ERROR = 'Something went wrong. Check your connection and try again.';

export default function ProfileDetails({ user }: Props) {
  const router = useRouter();
  const notify = useToast();
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [shownAvatarUrl, setShownAvatarUrl] = useState(user.avatarUrl);

  const [username, setUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState('');
  const [saving, setSaving] = useState(false);

  if (user.avatarUrl !== shownAvatarUrl) {
    setShownAvatarUrl(user.avatarUrl);
    setPreviewUrl(null);
  }

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function resetFileInput() {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected || uploading) return;

    const error = validateAvatar(selected);
    if (error) {
      setAvatarError(error);
      setPreviewUrl(null);
      resetFileInput();
      return;
    }

    setAvatarError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function cancelAvatar() {
    setPreviewUrl(null);
    setAvatarError('');
    resetFileInput();
    fileInputRef.current?.focus();
  }

  async function uploadAvatar() {
    if (!file || uploading) return;
    setUploading(true);
    setAvatarError('');
    try {
      const body = new FormData();
      body.append('file', file);
      await apiMutation('/api/users/me/avatar', { method: 'POST', body });
      resetFileInput();
      fileInputRef.current?.focus();
      notify('Profile photo updated.');
      router.refresh();
    } catch (error) {
      setAvatarError(
        error instanceof ApiRequestError
          ? (firstFieldError(error.fieldErrors, 'file') ?? error.message)
          : FALLBACK_ERROR,
      );
    } finally {
      setUploading(false);
    }
  }

  const trimmedUsername = username.trim();
  const usernameUnchanged = trimmedUsername === user.username;

  async function saveUsername(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usernameUnchanged || saving) return;

    const parsed = profileSchema.safeParse({ username });
    if (!parsed.success) {
      setUsernameError(parsed.error.issues[0]?.message ?? 'Enter a valid username.');
      return;
    }

    setSaving(true);
    setUsernameError('');
    try {
      await apiMutation('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      setUsername(parsed.data.username);
      notify('Username updated.');
      router.refresh();
    } catch (error) {
      setUsernameError(
        error instanceof ApiRequestError
          ? (firstFieldError(error.fieldErrors, 'username') ?? error.message)
          : FALLBACK_ERROR,
      );
    } finally {
      setSaving(false);
    }
  }

  const headingId = `${id}-heading`;
  const avatarHintId = `${id}-avatar-hint`;
  const avatarErrorId = `${id}-avatar-error`;
  const usernameId = `${id}-username`;
  const usernameErrorId = `${id}-username-error`;

  return (
    <section aria-labelledby={headingId} className="card grid gap-6">
      <div className="grid gap-1">
        <h2 id={headingId} className="text-grey-800 text-lg font-bold">
          Profile
        </h2>
        <p className="text-grey-500 text-sm">
          Your photo and username appear next to everything you post.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Image
          src={previewUrl ?? user.avatarUrl}
          alt={previewUrl ? 'Preview of your new profile photo' : 'Your profile photo'}
          width={80}
          height={80}
          unoptimized
          className="border-grey-100 h-20 w-20 shrink-0 rounded-full border-2 object-cover"
        />
        <div className="grid min-w-0 gap-2">
          <div className="flex flex-wrap gap-3">
            <label className="button-secondary cursor-pointer has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-purple-600/30">
              {file ? 'Choose another' : 'Choose photo'}
              <input
                ref={fileInputRef}
                type="file"
                accept={AVATAR_TYPES.join(',')}
                onChange={handleFileChange}
                aria-describedby={
                  avatarError ? `${avatarHintId} ${avatarErrorId}` : avatarHintId
                }
                aria-invalid={avatarError ? true : undefined}
                className="sr-only"
              />
            </label>
            {file && (
              <>
                <button
                  type="button"
                  onClick={uploadAvatar}
                  disabled={uploading}
                  className="button-primary"
                >
                  {uploading ? 'Uploading…' : 'Upload photo'}
                </button>
                <button
                  type="button"
                  onClick={cancelAvatar}
                  disabled={uploading}
                  className="button-secondary"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          <p id={avatarHintId} className="field-hint">
            {file ? file.name : 'JPG, PNG, or WebP, up to 2 MB.'}
          </p>
          {avatarError && (
            <p id={avatarErrorId} role="alert" className="field-error">
              {avatarError}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={saveUsername} noValidate className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor={usernameId} className="field-label">
            Username
          </label>
          <input
            id={usernameId}
            name="username"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={event => {
              setUsername(event.target.value);
              if (usernameError) setUsernameError('');
            }}
            aria-invalid={usernameError ? true : undefined}
            aria-describedby={usernameError ? usernameErrorId : undefined}
            className="input"
          />
          {usernameError && (
            <p id={usernameErrorId} className="field-error">
              {usernameError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={usernameUnchanged || saving}
          className="button-primary justify-self-start"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}
