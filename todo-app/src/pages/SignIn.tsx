import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Title from '../components/Title';
import googleIcon from '../assets/google.svg';
import closeIcon from '../assets/icon-cross.svg';
import eyeIcon from '../assets/eye.svg';
import eyeOffIcon from '../assets/eye-off.svg';
import isValidEmail from '../utils/isValidEmail';
import {
  doSignInWithEmailAndPassword,
  doSendPasswordResetEmail,
  doSignInWithGoogle,
  doSendEmailVerification,
} from '../services/auth';
import useAuth from '../hooks/useAuth';

export default function SignIn() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const emailErrorRef = useRef<HTMLInputElement | null>(null);
  const passwordErrorRef = useRef<HTMLInputElement | null>(null);
  const authErrorRef = useRef<HTMLInputElement | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { currentUser, loading } = useAuth();
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    emailErrorRef.current!.innerText = '';
    passwordErrorRef.current!.innerText = '';
    authErrorRef.current!.innerText = '';
    setShowVerificationPopup(false);

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
      } catch (error: unknown) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
          const err = error as { code: string; message?: string };
          switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              authErrorRef.current!.innerText =
                'Invalid email or password. Please try again.';
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
            case 'auth/email-not-verified':
              setVerificationEmail(emailValue);
              setPopupMessage(
                'Your email is not verified. Please verify your email to continue.'
              );
              setShowVerificationPopup(true);
              break;
            default:
              console.error('Firebase Auth Error:', err.code, err.message);
              authErrorRef.current!.innerText =
                err.message || 'An unexpected error occurred. Please try again.';
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

  async function handleResendVerificationEmail() {
    if (!verificationEmail) return;

    setIsResettingPassword(true);

    try {
      if (currentUser) {
        await doSendEmailVerification(currentUser);
        setPopupMessage('Verification email re-sent! Please check your inbox.');
      } else {
        setPopupMessage(
          'Could not find a user to re-send verification. Please try logging in again.'
        );
      }
    } catch (error: unknown) {
      console.error('Error re-sending verification email:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setPopupMessage(`Failed to re-send verification email: ${message}`);
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleResetPassword() {
    authErrorRef.current!.innerText = '';
    emailErrorRef.current!.innerText = '';
    setShowVerificationPopup(false);

    const emailValue = emailRef.current?.value.trim();

    if (!emailValue) {
      emailErrorRef.current!.innerText = 'Enter an email';
      return;
    }

    if (!isValidEmail(emailValue)) {
      emailErrorRef.current!.innerText = 'Enter a valid email';
      return;
    }

    if (isResettingPassword) {
      return;
    }

    setIsResettingPassword(true);

    try {
      await doSendPasswordResetEmail(emailValue);
      setPopupMessage(
        `A password reset link has been sent to ${emailValue}. Please check your inbox.`
      );
      emailRef.current!.value = '';
      passwordRef.current!.value = '';
      setShowResetPopup(true);
    } catch (error) {
      let errorMessage: string;

      if (error instanceof Error && 'code' in error) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/user-not-found':
            errorMessage =
              'No account found with this email address. Please check your email.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage =
              'An unexpected error occurred during password reset. Please try again.';
        }

        setPopupMessage(errorMessage);
      } else {
        console.error('Unknown Error:', error);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }

      authErrorRef.current!.innerText = errorMessage;
    } finally {
      setIsResettingPassword(false);
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

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <section className="mx-auto max-w-lg w-full space-y-8">
      {showResetPopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div className="bg-light-gray-50 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up">
            <button
              onClick={() => setShowResetPopup(false)}
              disabled={isResettingPassword}
              className="text-light-navy-850 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p>{popupMessage}</p>
          </div>
        </section>
      )}

      {showVerificationPopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div className="bg-light-gray-50 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up">
            <button
              onClick={() => {
                setShowVerificationPopup(false);
              }}
              disabled={isResettingPassword}
              className="text-light-navy-850 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p className="mb-4">{popupMessage}</p>
            {verificationEmail && (
              <button
                onClick={handleResendVerificationEmail}
                disabled={isResettingPassword}
                className="w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
              >
                {isResettingPassword ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        </section>
      )}

      <Title title="sign-in" />

      <div className="bg-light-gray-50 shadow-light px-6 py-5 rounded-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl md:text-3xl text-light-navy-850 font-bold mb-5 text-center">
            Welcome Back!
          </h2>

          <div className="space-y-6 mb-8">
            <div className="relative group">
              <input
                type="text"
                id="email"
                className="peer block w-full rounded-md border border-light-gray-300 bg-white px-4 py-3 text-light-navy-850 focus:border-primary-blue-500 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder=""
                ref={emailRef}
                disabled={isResettingPassword || isSigningIn}
              />

              <label
                htmlFor="email"
                className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white px-1.5 text-light-gray-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
              >
                Email
              </label>

              <p ref={emailErrorRef} className="mt-1 text-sm text-primary-red"></p>
            </div>

            <div className="relative group duration-500">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="peer block w-full rounded-md border border-light-gray-300 bg-white pl-4 pr-12 py-3 text-light-navy-850 focus:border-primary-blue-500 focus:ring-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder=""
                ref={passwordRef}
                disabled={isResettingPassword || isSigningIn}
              />

              <label
                htmlFor="password"
                className="bg-light-gray-50 text-sm absolute left-2.5 -top-3 bg-white px-1.5 text-light-gray-600 duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-lg peer-focus:-top-3 peer-focus:text-sm peer-focus:text-primary-blue-500 pointer-events-none"
              >
                Password
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 md:opacity-0 group-hover:opacity-100 cursor-pointer hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed duration-300"
                disabled={isResettingPassword || isSigningIn}
              >
                <img
                  src={showPassword ? eyeOffIcon : eyeIcon}
                  alt="Toggle password visibility"
                  className="w-5 h-5"
                />
              </button>

              <p ref={passwordErrorRef} className="mt-1 text-sm text-primary-red"></p>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword || isSigningIn}
                className="mt-2 text-sm text-light-gray-600 hover:text-primary-blue-500 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
              >
                {isResettingPassword ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSigningIn || isResettingPassword}
            className="mb-4 w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            Sign In
          </button>

          <p ref={authErrorRef} className="mb-4 text-sm text-primary-red"></p>

          <p className="text-center text-light-gray-600">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className={`text-light-navy-850 font-bold hover:text-primary-blue-500 duration-200 ${
                isResettingPassword || isSigningIn ? 'pointer-events-none opacity-50' : ''
              }`}
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
          type="button"
          onClick={handleClickForGoogle}
          disabled={loading || isSigningIn || isResettingPassword}
          className="w-full flex gap-3 justify-center items-center border border-light-gray-300 rounded-lg p-2.5 cursor-pointer hover:opacity-50 disabled:opacity-100 duration-200"
        >
          <img src={googleIcon} alt="Google icon" className="size-6" />
          Continue with Google
        </button>
      </div>
    </section>
  );
}
