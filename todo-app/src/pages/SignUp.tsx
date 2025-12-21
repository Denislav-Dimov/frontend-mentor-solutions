import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Title from '../components/Title';
import closeIcon from '../assets/icon-cross.svg';
import isValidEmail from '../utils/isValidEmail';
import {
  doCreateUserWithEmailAndPassword,
  doSendEmailVerification,
  doSignOut,
} from '../services/auth';
import useAuth from '../hooks/useAuth';

export default function SignUp() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const emailErrorRef = useRef<HTMLInputElement | null>(null);
  const passwordErrorRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLInputElement | null>(null);
  const authErrorRef = useRef<HTMLInputElement | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { currentUser, loading } = useAuth();
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    emailErrorRef.current!.innerText = '';
    passwordErrorRef.current!.innerText = '';
    confirmPasswordErrorRef.current!.innerText = '';
    authErrorRef.current!.innerText = '';

    const emailValue = emailRef.current?.value.trim();
    const passwordValue = passwordRef.current?.value.trim();
    const confirmPasswordValue = confirmPasswordRef.current?.value.trim();

    if (!emailValue) {
      emailErrorRef.current!.innerText = 'Enter an email';
      return;
    }

    if (!isValidEmail(emailValue)) {
      emailErrorRef.current!.innerText = 'Enter a valid email';
      return;
    }

    if (!passwordValue) {
      passwordErrorRef.current!.innerText = 'Enter a password';
      return;
    }

    if (passwordValue.length < 6) {
      passwordErrorRef.current!.innerText = 'Password must be at least 6 characters';
      return;
    }

    if (confirmPasswordValue !== passwordValue) {
      confirmPasswordErrorRef.current!.innerText =
        'Confirm password must match the password';
      return;
    }

    if (!isRegistering) {
      setIsRegistering(true);
      try {
        const { user } = await doCreateUserWithEmailAndPassword(
          emailValue,
          passwordValue
        );

        if (user) {
          await doSendEmailVerification(user);
          setPopupMessage(
            'Verification email sent! Please check your inbox and verify your email before signing in.'
          );
          setShowVerificationPopup(true);
          await doSignOut();
          setIsRegistering(false);
        } else {
          authErrorRef.current!.innerText =
            'Registration successful, but unable to send verification email. Please try signing in and follow the instructions.';
        }
      } catch (error) {
        setIsRegistering(false);
        if (error instanceof Error && 'code' in error) {
          if (error.code === 'auth/email-already-in-use') {
            authErrorRef.current!.innerText = 'Email already in use';
          } else if (error.code === 'auth/weak-password') {
            authErrorRef.current!.innerText = 'Password is too weak';
          } else {
            authErrorRef.current!.innerText = 'An error occurred. Please try again.';
          }
        } else {
          authErrorRef.current!.innerText = 'An error occurred. Please try again.';
        }
      }
    }
  }

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      {showVerificationPopup && (
        <section className="fixed inset-0 z-50 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div className="bg-light-gray-50 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up">
            <button
              onClick={() => setShowVerificationPopup(false)}
              className="text-light-navy-850 hover:opacity-80 duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p>{popupMessage}</p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-lg w-full space-y-8">
        <Title title="sign-up" />

        <form
          onSubmit={handleSubmit}
          action=""
          className="bg-light-gray-50 shadow-light px-6 py-5 rounded-lg"
        >
          <h2 className="text-2xl md:text-3xl text-light-navy-850 font-bold mb-5 text-center">
            Create a New Account
          </h2>

          <div className="space-y-6 mb-8">
            <div className="relative">
              <input
                type="text"
                id="email"
                className="peer block w-full rounded-md border border-light-gray-300 bg-white px-4 py-3 text-light-navy-850 focus:border-primary-blue-500 focus:ring-0 focus:outline-none"
                placeholder=""
                ref={emailRef}
              />

              <label
                htmlFor="email"
                className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white px-1.5 text-light-gray-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
              >
                Email
              </label>

              <p ref={emailErrorRef} className="mt-1 text-sm text-primary-red"></p>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                className="peer block w-full rounded-md border border-light-gray-300 bg-white px-4 py-3 text-light-navy-850 focus:border-primary-blue-500 focus:ring-0 focus:outline-none"
                placeholder=""
                ref={passwordRef}
              />

              <label
                htmlFor="password"
                className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white px-1.5 text-light-gray-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
              >
                Password
              </label>

              <p ref={passwordErrorRef} className="mt-1 text-sm text-primary-red"></p>
            </div>

            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                className="peer block w-full rounded-md border border-light-gray-300 bg-white px-4 py-3 text-light-navy-850 focus:border-primary-blue-500 focus:ring-0 focus:outline-none"
                placeholder=""
                ref={confirmPasswordRef}
              />

              <label
                htmlFor="confirmPassword"
                className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white px-1.5 text-light-gray-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
              >
                Confirm Password
              </label>

              <p
                ref={confirmPasswordErrorRef}
                className="mt-1 text-sm text-primary-red"
              ></p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isRegistering}
            className="mb-4 w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            Sign Up
          </button>

          <p ref={authErrorRef} className="mb-4 text-sm text-primary-red"></p>

          <p className="text-center text-light-gray-600">
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="text-light-navy-850 font-bold hover:text-primary-blue-500 duration-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
