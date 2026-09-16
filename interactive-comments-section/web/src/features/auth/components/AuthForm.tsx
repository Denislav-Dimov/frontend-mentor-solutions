'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, SubmitEvent, useState } from 'react';
import { loginSchema, registerSchema, antiforgerySchema, apiErrorSchema } from '../schemas';

type Mode = 'login' | 'register';

type Values = {
  usernameOrEmail: string;
  username: string;
  email: string;
  password: string;
};

type Props = {
  mode: Mode;
};

export default function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    usernameOrEmail: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = (isRegister ? registerSchema : loginSchema).safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check the form.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const tokenResponse = await fetch('/api/security/antiforgery', {
        credentials: 'include',
      });

      if (!tokenResponse.ok) {
        throw new Error('Unable to prepare this request.');
      }

      const token = antiforgerySchema.parse(await tokenResponse.json()).token;

      const response = await fetch(`/api/users/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
        credentials: 'include',
        body: JSON.stringify(
          isRegister
            ? { username: values.username, email: values.email, password: values.password }
            : { usernameOrEmail: values.usernameOrEmail, password: values.password },
        ),
      });

      if (!response.ok) {
        if (!isRegister && response.status === 401) {
          throw new Error('The username or password is incorrect.');
        }

        const payload = apiErrorSchema.safeParse(await response.json().catch(() => null));

        const apiMessage = payload.success
          ? (Object.values(payload.data.errors ?? {})[0]?.[0] ??
            payload.data.detail ??
            payload.data.title)
          : undefined;

        throw new Error(apiMessage ?? `The API returned ${response.status}.`);
      }
      router.push('/');
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : 'Unable to continue.',
      );
    } finally {
      setPending(false);
    }
  }

  const updateValue = (
    e: ChangeEvent<HTMLInputElement, HTMLInputElement>,
    value: keyof Values,
  ) => setValues(prev => ({ ...prev, [value]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-lg bg-white p-7 md:p-9">
      <div>
        <Link href="/" className="text-sm font-bold text-purple-600 hover:underline">
          Back to comments
        </Link>
        <h1 className="text-grey-800 text-2xl font-bold">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-grey-500 mt-1 text-sm">
          Join the conversation and keep your comments in one place.
        </p>
      </div>
      {isRegister && (
        <label className="grid gap-2 text-sm font-bold">
          Name
          <input
            name="username"
            className="input"
            autoComplete="username"
            onChange={e => updateValue(e, 'username')}
          />
        </label>
      )}
      {isRegister && (
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            onChange={e => updateValue(e, 'email')}
          />
        </label>
      )}
      {!isRegister && (
        <label className="grid gap-2 text-sm font-bold">
          Username or email
          <input
            name="usernameOrEmail"
            className="input"
            autoComplete="username"
            onChange={e => updateValue(e, 'usernameOrEmail')}
          />
        </label>
      )}
      <label className="grid gap-2 text-sm font-bold">
        Password
        <input
          name="password"
          type="password"
          className="input"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          onChange={e => updateValue(e, 'password')}
        />
      </label>
      {error && (
        <p className="text-sm text-pink-400" role="alert">
          {error}
        </p>
      )}
      <button disabled={pending} className="button-primary w-full disabled:opacity-50">
        {pending ? 'Working...' : isRegister ? 'Create account' : 'Log in'}
      </button>
      <p className="text-grey-500 text-center text-sm">
        {isRegister ? 'Already have an account? ' : 'Need an account? '}
        <Link href={isRegister ? '/login' : '/register'} className="font-bold text-purple-600">
          {isRegister ? 'Log in' : 'Register'}
        </Link>
      </p>
    </form>
  );
}
