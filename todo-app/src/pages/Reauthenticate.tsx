import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, doDeleteUser, doReauthenticateWithCredential } from '../features/auth';
import EyeButton from '../components/EyeButton';
import Title from '../components/Title';

export default function Reauthenticate() {
  const { currentUser } = useAuth();
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = passwordRef.current?.value.trim();

    setPasswordError('');

    if (!currentUser || !currentUser.email) {
      setPasswordError('No user is currently signed in.');
      return;
    }

    if (!password) {
      setPasswordError('Enter a password');
      return;
    }

    setIsSubmitting(true);

    try {
      await doReauthenticateWithCredential(currentUser, password);
      await doDeleteUser(currentUser);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code: string; message?: string };
        if (err.code === 'auth/user-not-found') {
          setPasswordError('User not found.');
        }
      } else {
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg w-full space-y-8">
      <Title title="reauthenticate" />

      <form
        onSubmit={handleSubmit}
        className="bg-light-gray-50 dark:bg-dark-navy-900 shadow-light dark:shadow-dark px-6 py-5 rounded-lg"
      >
        <h2 className="text-2xl md:text-3xl text-light-navy-850 dark:text-dark-purple-100 font-bold mb-5 text-center">
          Recent Sign-in Required
        </h2>

        <div className="relative group duration-500 mb-8">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            className="peer block w-full rounded-md border border-light-gray-300 dark:border-dark-purple-800 bg-white dark:bg-dark-navy-900 pl-4 pr-12 py-3 text-light-navy-850 dark:text-dark-purple-100 focus:border-primary-blue-500 focus:ring-0 focus:outline-none"
            placeholder=""
            ref={passwordRef}
          />

          <label
            htmlFor="password"
            className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white dark:bg-dark-navy-900 px-1.5 text-light-gray-600 dark:text-dark-purple-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
          >
            Password
          </label>

          <EyeButton
            showPassword={showPassword}
            handleClick={() => setShowPassword(prev => !prev)}
          />

          <p className="mt-1 text-sm text-primary-red">{passwordError}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-primary-red hover:bg-primary-red/70 disabled:bg-primary-red/50 disabled:cursor-not-allowed text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            Delete
          </button>

          <Link
            to="/"
            className="bg-light-gray-300 hover:bg-light-gray-300/70 dark:bg-dark-purple-700 dark:hover:bg-dark-purple-700/70 p-3 text-center text-light-navy-850 dark:text-dark-purple-100 font-bold duration-200 rounded-md cursor-pointer"
          >
            Back
          </Link>
        </div>
      </form>
    </section>
  );
}
