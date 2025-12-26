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
} from './services/auth.service';

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
};
