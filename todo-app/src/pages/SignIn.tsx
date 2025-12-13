import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Title from '../components/Title';
import googleIcon from '../assets/google.svg';
import isValidEmail from '../utils/isValidEmail';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../services/auth';
import useAuth from '../hooks/useAuth';

export default function SignIn() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const emailErrorRef = useRef<HTMLInputElement | null>(null);
  const passwordErrorRef = useRef<HTMLInputElement | null>(null);
  const authErrorRef = useRef<HTMLInputElement | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { currentUser, loading } = useAuth();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    emailErrorRef.current!.innerText = '';
    passwordErrorRef.current!.innerText = '';
    authErrorRef.current!.innerText = '';

    const emailValue = emailRef.current?.value.trim();
    const passwordValue = passwordRef.current?.value.trim();

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

    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(emailValue, passwordValue);
        authErrorRef.current!.innerText = '';
      } catch (error) {
        if (error instanceof Error && 'code' in error) {
          switch (error.code) {
            case 'auth/user-not-found':
              authErrorRef.current!.innerText =
                'No account found with this email address. Please check your email or sign up.';
              break;
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              authErrorRef.current!.innerText = 'Incorrect password. Please try again.';
              break;
            case 'auth/invalid-email':
              authErrorRef.current!.innerText =
                'The email address is not valid. Please enter a valid email.';
              break;
            case 'auth/user-disabled':
              authErrorRef.current!.innerText =
                'This account has been disabled. Please contact support.';
              break;
            case 'auth/too-many-requests':
              authErrorRef.current!.innerText =
                'Too many failed login attempts. Please try again later.';
              break;
            default:
              console.error('Firebase Auth Error:', error.code, error.message);
              authErrorRef.current!.innerText =
                'An unexpected error occurred. Please try again.';
          }
        } else {
          console.error('Unknown Error:', error);
          authErrorRef.current!.innerText =
            'An unexpected error occurred. Please try again.';
        }
      } finally {
        setIsSigningIn(false);
      }
    }
  }

  async function handleClickForGoogle() {
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithGoogle();
      } catch (error) {
        if (error instanceof Error && 'code' in error) {
          if (error.code) {
            switch (error.code) {
              case 'auth/popup-closed-by-user':
                authErrorRef.current!.innerText =
                  'Sign-in popup closed. Please try again.';
                break;
              case 'auth/cancelled-popup-request':
                authErrorRef.current!.innerText =
                  'Sign-in popup request was cancelled. Please try again.';
                break;
              case 'auth/popup-blocked':
                authErrorRef.current!.innerText =
                  'Popup blocked by your browser. Please allow popups for this site and try again.';
                break;
              case 'auth/operation-not-allowed':
                authErrorRef.current!.innerText =
                  'Google sign-in is not enabled. Please contact support.';
                break;
              case 'auth/account-exists-with-different-credential':
                authErrorRef.current!.innerText =
                  'An account with this email already exists. Please sign in with your email and password instead.';
                break;
              case 'auth/unauthorized-domain':
                authErrorRef.current!.innerText =
                  'Your domain is not authorized for this operation. Please check Firebase settings.';
                break;
              default:
                authErrorRef.current!.innerText = `An unknown authentication error occurred: ${error.message}`;
                console.error('Firebase Auth Error:', error);
                break;
            }
          } else {
            authErrorRef.current!.innerText = `An unexpected error occurred: ${error.message}`;
            console.error('General Error:', error);
          }
        }
      } finally {
        setIsSigningIn(false);
      }
    }
  }

  if (currentUser) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <section className="mx-auto max-w-lg w-full space-y-8">
      <Title title="sign-in" />

      <div className="bg-light-gray-50 shadow-light px-6 py-5 rounded-lg">
        <form onSubmit={handleSubmit} action="">
          <h2 className="text-2xl md:text-3xl text-light-navy-850 font-bold mb-5 text-center">
            Welcome Back!
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
          </div>

          <button
            type="submit"
            disabled={loading || isSigningIn}
            className="mb-4 w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            Sign In
          </button>

          <p ref={authErrorRef} className="mb-4 text-sm text-primary-red"></p>

          <p className="text-center text-light-gray-600">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="text-light-navy-850 font-bold hover:text-primary-blue-500 duration-200"
            >
              Sign up
            </Link>
          </p>

          <div className="relative my-8">
            <hr className="text-light-gray-300" />
            <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-light-gray-50 px-2 text-xl font-bold text-light-navy-850">
              OR
            </p>
          </div>
        </form>

        <button
          type="submit"
          onClick={handleClickForGoogle}
          disabled={loading || isSigningIn}
          className="w-full flex gap-3 justify-center items-center border border-light-gray-300 rounded-lg p-2.5 cursor-pointer hover:opacity-50 disabled:opacity-100 duration-200"
        >
          <img src={googleIcon} alt="google icon" className="size-6" />
          Continue with Google
        </button>
      </div>
    </section>
  );
}
