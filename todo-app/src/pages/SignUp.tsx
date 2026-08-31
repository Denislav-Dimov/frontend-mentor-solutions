import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import closeIcon from '../assets/icon-cross.svg';
import {
  doCreateUserWithEmailAndPassword,
  doSendEmailVerification,
  doSignOut,
  useAuth,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  mapSignUpError,
} from '../features/auth';
import InputEmail from '../components/form/InputEmail';
import InputPassword from '../components/form/InputPassword';
import useOutsideClick from '../hooks/useOutsideClick';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const [isRegistering, setIsRegistering] = useState(false);

  const { currentUser, loading } = useAuth();

  const navigate = useNavigate();

  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationPopupMessage, setVerificationPopupMessage] = useState('');
  const showVerificationPopupRef = useOutsideClick(() => {
    if (showVerificationPopup) {
      setShowVerificationPopup(false);
      navigate('/sign-in');
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isRegistering) return;

    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAuthError('');

    const emailValue = email.trim();
    const passwordValue = password.trim();
    const confirmPasswordValue = confirmPassword.trim();

    const emailValid = validateEmail(emailValue);
    const passwordValid = validatePassword(passwordValue);
    const confirmPasswordValid = validateConfirmPassword(
      passwordValue,
      confirmPasswordValue
    );

    if (emailValid || passwordValid || confirmPasswordValid) {
      setEmailError(emailValid);
      setPasswordError(passwordValid);
      setConfirmPasswordError(confirmPasswordValid);
      return;
    }

    setIsRegistering(true);

    try {
      const { user } = await doCreateUserWithEmailAndPassword(emailValue, passwordValue);

      if (!user) {
        setAuthError(
          'Registration successful, but unable to send verification email. Please try signing in and follow the instructions'
        );
        return;
      }

      await doSendEmailVerification(user);

      setVerificationPopupMessage(
        'Verification email sent! Please check your inbox and verify your email before signing in.'
      );
      setShowVerificationPopup(true);
      await doSignOut();
    } catch (error) {
      if (error instanceof FirebaseError) {
        setAuthError(mapSignUpError(error.code));
      }
    } finally {
      setIsRegistering(false);
    }
  }

  if (currentUser && currentUser.emailVerified) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      {showVerificationPopup && (
        <section className="fixed inset-0 z-50 px-5 h-screen grid place-items-center bg-overlay-navy-900 animate-fade-in">
          <div
            ref={showVerificationPopupRef}
            className="bg-light-gray-50 dark:bg-dark-navy-900 flex flex-col items-end justify-start gap-5 rounded-lg p-8 max-w-sm w-full text-center animate-slide-up"
          >
            <button
              onClick={() => {
                setShowVerificationPopup(false);
                navigate('/sign-in');
              }}
              className="text-light-navy-850 dark:text-dark-purple-100 hover:opacity-80 duration-200 cursor-pointer"
            >
              <img src={closeIcon} alt="close icon" />
            </button>
            <p>{verificationPopupMessage}</p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-lg w-full space-y-8">
        <Title title="sign-up" />

        <form
          onSubmit={handleSubmit}
          action=""
          className="bg-light-gray-50 dark:bg-dark-navy-900 shadow-light dark:shadow-dark px-6 py-5 rounded-lg"
        >
          <h2 className="text-2xl md:text-3xl text-light-navy-850 dark:text-dark-purple-100 font-bold mb-5 text-center">
            Create a New Account
          </h2>

          <div className="space-y-6 mb-8">
            <InputEmail email={email} setEmail={setEmail} emailError={emailError} />

            <InputPassword
              label="Password"
              password={password}
              setPassword={setPassword}
              passwordError={passwordError}
            />

            <InputPassword
              label="Confirm Password"
              password={confirmPassword}
              setPassword={setConfirmPassword}
              passwordError={confirmPasswordError}
            />
          </div>

          <button
            type="submit"
            disabled={loading || isRegistering}
            className="mb-4 w-full p-2 bg-primary-blue-500 hover:opacity-70 disabled:bg-light-gray-300 dark:disabled:bg-dark-purple-700 disabled:hover:opacity-100 text-light-gray-50 font-bold duration-200 rounded-md cursor-pointer"
          >
            {isRegistering ? 'Signing Up...' : 'Sign Up'}
          </button>

          <p className="mb-4 text-sm text-primary-red">{authError}</p>

          <p className="text-center text-light-gray-600 dark:text-dark-purple-600">
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="text-light-navy-850 dark:text-dark-purple-100 font-bold hover:text-primary-blue-500 duration-200"
            >
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
