import { auth } from '../../../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User,
} from 'firebase/auth';

export async function doCreateUserWithEmailAndPassword(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function doSendEmailVerification(user: User) {
  return sendEmailVerification(user);
}

export async function doSignInWithEmailAndPassword(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  if (user && !user.emailVerified) {
    throw { code: 'auth/email-not-verified', message: 'Email not verified' };
  }

  return user;
}

export async function doSendPasswordResetEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function doSignInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  return user;
}

export async function doSignOut() {
  return auth.signOut();
}
