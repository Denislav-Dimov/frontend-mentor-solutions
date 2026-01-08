import { auth } from '../../../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  type User,
  signOut,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { EmailAuthProvider } from 'firebase/auth/web-extension';

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
  return signOut(auth);
}

export async function doDeleteUser(user: User) {
  return deleteUser(user);
}
export async function doReauthenticateWithCredential(
  currentUser: User,
  password: string
) {
  if (!currentUser.email) {
    throw { code: 'auth/user-not-found' };
  }

  const credential = EmailAuthProvider.credential(currentUser.email, password);

  return reauthenticateWithCredential(currentUser, credential);
}
