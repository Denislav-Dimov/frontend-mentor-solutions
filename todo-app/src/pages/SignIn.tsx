import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Link, Navigate } from 'react-router-dom';
import Title from '../components/Title';
import googleIcon from '../assets/google.svg';
import closeIcon from '../assets/icon-cross.svg';
import {
  doSignInWithEmailAndPassword,
  doSendPasswordResetEmail,
  doSignInWithGoogle,
  doSendEmailVerification,
  useAuth,
  validateEmail,
  validatePassword,
  mapSignInError,
  mapSignInGoogleError,
} from '../features/auth';
import useOutsideClick from '../hooks/useOutsideClick';
import InputEmail from '../components/form/InputEmail';
import InputPassword from '../components/form/InputPassword';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const [isSigningIn, setIsSigningIn] = useState(false);

  const { currentUser, loading } = useAuth();

  const [popupMessage, setPopupMessage] = useState('');

  const showResetPopupRef = useOutsideClick(() => setShowResetPopup(false));
  const [showResetPopup, setShowResetPopup] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const showVerificationPopupRef = useOutsideClick(() => setShowVerificationPopup(false));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSigningIn) return;

    setEmailError('');
    setPasswordError('');
    setAuthError('');

    const emailValue = email.trim();
    const passwordValue = password.trim();

    const emailValid = validateEmail(emailValue);
    const passwordValid = validatePassword(passwordValue);

    if (emailValid || passwordValid) {
      setEmailError(emailValid);
      setPasswordError(passwordValid);
      return;
    }

    setIsSigningIn(true);

    try {
      await doSignInWithEmailAndPassword(emailValue, passwordValue);
    } catch (error) {
      if (!(error instanceof FirebaseError)) return;

      if (error.code === 'auth/email-not-verified') {
        setVerificationEmail(emailValue);
        setPopupMessage(
          'Your email is not verified. Please verify your email to continue'
        );
        setShowVerificationPopup(true);
        return;
      }

      setAuthError(mapSignInError(error.code));
    } finally {
      setIsSigningIn(false);
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
    } catch (error) {
      const message = error instanceof FirebaseError ? error.message : 'Unknown error';
      setPopupMessage(`Failed to re-send verification email: ${message}`);
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleResetPassword() {
    if (isResettingPassword) return;

    setAuthError('');
    setEmailError('');

    const emailValue = email.trim();

    const emailValid = validateEmail(emailValue);

    if (emailValid) {
      setEmailError(emailValid);
      return;
    }

    setIsResettingPassword(true);

    try {
      await doSendPasswordResetEmail(emailValue);
      setPopupMessage(
        `A password reset link has been sent to ${emailValue}. Please check your inbox.`
      );
      setShowResetPopup(true);
      setPassword('');
    } catch (error) {
      if (error instanceof FirebaseError) {
        setAuthError(mapSignInError(error.code));
      }
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleClickForGoogle() {
    if (isSigningIn) return;

    setIsSigningIn(true);

    try {
      await doSignInWithGoogle();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setAuthError(mapSignInGoogleError(error.code));
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <section className="mx-auto max-w-lg w-full space-y-8">
      {showResetPopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div
            ref={showResetPopupRef}
            className="bg-light-gray-50 dark:bg-dark-navy-900 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up"
          >
            <button
              onClick={() => setShowResetPopup(false)}
              disabled={isResettingPassword}
              className="text-light-navy-850 dark:text-dark-purple-100 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p>{popupMessage}</p>
          </div>
        </section>
      )}

      {showVerificationPopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div
            ref={showVerificationPopupRef}
            className="bg-light-gray-50 dark:bg-dark-navy-900 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up"
          >
            <button
              onClick={() => setShowVerificationPopup(false)}
              disabled={isResettingPassword}
              className="text-light-navy-850 dark:text-dark-purple-100 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p className="mb-4">{popupMessage}</p>
            {verificationEmail && (
              <button
                onClick={handleResendVerificationEmail}
                disabled={isResettingPassword}
                className="w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 dark:disabled:bg-dark-purple-700 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
              >
                {isResettingPassword ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        </section>
      )}

      <Title title="sign-in" />

      <div className="bg-light-gray-50 dark:bg-dark-navy-900 shadow-light dark:shadow-dark px-6 py-5 rounded-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl md:text-3xl text-light-navy-850 dark:text-dark-purple-100 font-bold mb-5 text-center">
            Welcome Back!
          </h2>

          <div className="space-y-6 mb-8">
            <InputEmail email={email} setEmail={setEmail} emailError={emailError} />

            <div className="space-y-2">
              <InputPassword
                label="Password"
                password={password}
                setPassword={setPassword}
                passwordError={passwordError}
              />

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResettingPassword || isSigningIn}
                className="text-sm text-light-gray-600 dark:text-dark-purple-600 hover:text-primary-blue-500 disabled:opacity-50 disabled:cursor-not-allowed duration-200 cursor-pointer"
              >
                {isResettingPassword ? 'Sending...' : 'Forgot password?'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isSigningIn || isResettingPassword}
            className="mb-4 w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 dark:disabled:bg-dark-purple-700 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="mb-4 text-sm text-primary-red">{authError}</p>

          <p className="text-center text-light-gray-600 dark:text-dark-purple-600">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className={`text-light-navy-850 dark:text-dark-purple-100 font-bold hover:text-primary-blue-500 duration-200 ${
                isResettingPassword || isSigningIn ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Sign up
            </Link>
          </p>

          <div className="relative my-8">
            <hr className="text-light-gray-300 dark:text-dark-purple-800" />
            <p className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-light-gray-50 dark:bg-dark-navy-900 px-2 text-xl font-bold text-light-navy-850 dark:text-dark-purple-100">
              OR
            </p>
          </div>
        </form>

        <button
          type="button"
          onClick={handleClickForGoogle}
          disabled={loading || isSigningIn || isResettingPassword}
          className="w-full flex gap-3 justify-center items-center border border-light-gray-300 dark:border-dark-purple-800 rounded-lg p-2.5 cursor-pointer hover:opacity-50 disabled:opacity-100 duration-200"
        >
          <img src={googleIcon} alt="Google icon" className="size-6" />
          Continue with Google
        </button>
      </div>
    </section>
  );
}
