export { default as AuthProvider } from './context/auth.provider';
export { default as useAuth } from './hooks/useAuth';
export { default as AuthGuard } from './components/AuthGuard';
export {
  doCreateUserWithEmailAndPassword,
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
  doSendEmailVerification,
  doSendPasswordResetEmail,
  doSignOut,
  doReauthenticateWithCredential,
  doDeleteUser,
} from './services/auth.service';
export {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './validation/validate';
export {
  mapSignInError,
  mapSignInGoogleError,
  mapSignUpError,
  mapReauthenticateError,
} from './validation/firebaseErrors';
