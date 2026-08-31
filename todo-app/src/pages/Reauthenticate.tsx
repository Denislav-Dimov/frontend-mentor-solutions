import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Link } from 'react-router-dom';
import Title from '../components/Title';
import InputPassword from '../components/form/InputPassword';
import {
  useAuth,
  validatePassword,
  doDeleteUser,
  doReauthenticateWithCredential,
  mapReauthenticateError,
} from '../features/auth';

export default function Reauthenticate() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) return;

    const passwordValue = password.trim();

    setPasswordError('');

    if (!currentUser || !currentUser.email) {
      setPasswordError('No user is currently signed in.');
      return;
    }

    const passwordValid = validatePassword(passwordValue);

    if (passwordValid) {
      setPasswordError(passwordValid);
      return;
    }

    setIsSubmitting(true);

    try {
      await doReauthenticateWithCredential(currentUser, passwordValue);
      await doDeleteUser(currentUser);
    } catch (error) {
      if (error instanceof FirebaseError) {
        setPasswordError(mapReauthenticateError(error.code));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

        <div className="space-y-8">
          <InputPassword
            label="Password"
            password={password}
            setPassword={setPassword}
            passwordError={passwordError}
          />

          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-3 bg-primary-red hover:bg-primary-red/70 disabled:bg-primary-red/50 disabled:cursor-not-allowed text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>

            <Link
              to="/"
              className="bg-light-gray-300 hover:bg-light-gray-300/70 dark:bg-dark-purple-700 dark:hover:bg-dark-purple-700/70 p-3 text-center text-light-navy-850 dark:text-dark-purple-100 font-bold duration-200 rounded-md cursor-pointer"
            >
              Back
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}
