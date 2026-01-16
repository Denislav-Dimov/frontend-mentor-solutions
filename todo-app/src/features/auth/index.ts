import AuthProvider from './context/auth.provider';
import useAuth from './hooks/useAuth';
import AuthGuard from './components/AuthGuard';
import {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSendEmailVerification,
  doSendPasswordResetEmail,
  doSignOut,
  doReauthenticateWithCredential,
  doDeleteUser,
} from './services/auth.service';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './validation/validate';
import {
  mapSignInError,
  mapSignInGoogleError,
  mapSignUpError,
  mapReauthenticateError,
} from './validation/firebaseErrors';

export {
  AuthProvider,
  useAuth,
  AuthGuard,
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSendEmailVerification,
  doSendPasswordResetEmail,
  doSignOut,
  doReauthenticateWithCredential,
  doDeleteUser,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  mapSignInError,
  mapSignInGoogleError,
  mapSignUpError,
  mapReauthenticateError,
};
