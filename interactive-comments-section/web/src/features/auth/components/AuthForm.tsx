'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import type { ComponentProps, SubmitEvent } from 'react';
import { ApiRequestError, apiMutation, resetAntiforgeryToken } from '@/features/shared';
import { loginSchema, registerSchema } from '../schemas';

type Mode = 'login' | 'register';
type FieldName = 'usernameOrEmail' | 'username' | 'email' | 'password';
type Values = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELDS: Record<Mode, FieldName[]> = {
  login: ['usernameOrEmail', 'password'],
  register: ['username', 'email', 'password'],
};

const COPY = {
  login: {
    title: 'Log in',
    subtitle: 'Welcome back. Log in to comment, reply, and vote.',
    submit: 'Log in',
    pending: 'Logging in…',
    switchPrompt: 'New here?',
    switchLabel: 'Create an account',
    switchHref: '/register',
  },
  register: {
    title: 'Create an account',
    subtitle: 'Pick a username to join the conversation and keep track of your activity.',
    submit: 'Create account',
    pending: 'Creating account…',
    switchPrompt: 'Already have an account?',
    switchLabel: 'Log in',
    switchHref: '/login',
  },
} as const;

function toFieldName(key: string, mode: Mode): FieldName | null {
  const normalized = key.toLowerCase();
  if (normalized.startsWith('password')) return 'password';
  if (mode === 'login') {
    return normalized.includes('username') || normalized.includes('email')
      ? 'usernameOrEmail'
      : null;
  }
  if (normalized.includes('username')) return 'username';
  if (normalized.includes('email')) return 'email';
  return null;
}

type Props = {
  mode: Mode;
  returnTo: string;
};

export default function AuthForm({ mode, returnTo }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<Values>({
    usernameOrEmail: '',
    username: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [pending, setPending] = useState(false);
  const isRegister = mode === 'register';
  const copy = COPY[mode];
  const switchHref =
    returnTo === '/'
      ? copy.switchHref
      : `${copy.switchHref}?returnTo=${encodeURIComponent(returnTo)}`;

  function focusFirstInvalid(errors: FieldErrors) {
    const first = FIELDS[mode].find(name => errors[name]);
    if (!first) return;
    requestAnimationFrame(() => {
      const element = formRef.current?.elements.namedItem(first);
      if (element instanceof HTMLInputElement) element.focus();
    });
  }

  function updateValue(name: FieldName, value: string) {
    setValues(previous => ({ ...previous, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(previous => ({ ...previous, [name]: undefined }));
    }
  }

  function validate() {
    const parsed = isRegister
      ? registerSchema.safeParse(values)
      : loginSchema.safeParse(values);
    if (parsed.success) return { data: parsed.data, errors: null };

    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const name = issue.path[0] as FieldName;
      errors[name] ??= issue.message;
    }
    return { data: null, errors };
  }

  function handleApiError(error: unknown) {
    if (!(error instanceof ApiRequestError)) {
      setFormError('Something went wrong. Check your connection and try again.');
      return;
    }
    if (!isRegister && error.status === 401) {
      setFormError('That username, email, or password is incorrect.');
      return;
    }

    const mapped: FieldErrors = {};
    const unmapped: string[] = [];
    for (const [key, messages] of Object.entries(error.fieldErrors ?? {})) {
      const message = messages[0];
      if (!message) continue;
      const name = toFieldName(key, mode);
      if (name) mapped[name] ??= message;
      else unmapped.push(message);
    }

    const hasFieldErrors = Object.keys(mapped).length > 0;
    setFieldErrors(mapped);
    setFormError(unmapped[0] ?? (hasFieldErrors ? '' : error.message));
    focusFirstInvalid(mapped);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const { data, errors } = validate();
    setFormError('');
    if (!data) {
      setFieldErrors(errors);
      focusFirstInvalid(errors);
      return;
    }

    setFieldErrors({});
    setPending(true);
    try {
      await apiMutation(`/api/users/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      resetAntiforgeryToken();
      router.push(returnTo);
      router.refresh();
    } catch (error) {
      handleApiError(error);
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-6">
      <div>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </div>

      <div className="grid gap-5">
        {isRegister ? (
          <>
            <Field
              label="Username"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={values.username}
              error={fieldErrors.username}
              onValueChange={value => updateValue('username', value)}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              error={fieldErrors.email}
              onValueChange={value => updateValue('email', value)}
            />
          </>
        ) : (
          <Field
            label="Username or email"
            name="usernameOrEmail"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={values.usernameOrEmail}
            error={fieldErrors.usernameOrEmail}
            onValueChange={value => updateValue('usernameOrEmail', value)}
          />
        )}
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={values.password}
          error={fieldErrors.password}
          hint={
            isRegister
              ? 'At least 8 characters, including an uppercase letter and a number.'
              : undefined
          }
          onValueChange={value => updateValue('password', value)}
        />
      </div>

      {formError && (
        <p role="alert" className="field-error">
          {formError}
        </p>
      )}

      {isRegister && (
        <p className="field-hint">
          Educational demo. Your username, email, and hashed password are stored until you
          delete your account. Read the{' '}
          <Link href="/privacy" className="link">
            privacy notice
          </Link>
          .
        </p>
      )}

      <button type="submit" disabled={pending} className="button-primary w-full">
        {pending ? copy.pending : copy.submit}
      </button>

      <p className="text-grey-500 text-center text-sm">
        {copy.switchPrompt}{' '}
        <Link href={switchHref} className="link">
          {copy.switchLabel}
        </Link>
      </p>
    </form>
  );
}

type FieldProps = Omit<ComponentProps<'input'>, 'onChange' | 'value' | 'name'> & {
  label: string;
  name: FieldName;
  value: string;
  error?: string;
  hint?: string;
  onValueChange: (value: string) => void;
};

function Field({ label, name, error, hint, onValueChange, ...inputProps }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ');

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        name={name}
        required
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={event => onValueChange(event.target.value)}
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
