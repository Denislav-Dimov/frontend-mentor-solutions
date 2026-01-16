export function mapSignInError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password';

    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later';

    case 'auth/user-disabled':
      return 'Account disabled';

    default:
      return 'An unexpected error occurred';
  }
}

export function mapSignInGoogleError(code: string): string {
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup closed. Please try again';

    case 'auth/cancelled-popup-request':
      return 'Sign-in popup request was cancelled. Please try again';

    case 'auth/popup-blocked':
      return 'Popup blocked by your browser. Please allow popups for this site and try again';

    default:
      return 'An unexpected error occurred';
  }
}

export function mapSignUpError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already in use';

    case 'auth/weak-password':
      return 'Password is too weak';

    default:
      return 'An unexpected error occurred';
  }
}

export function mapReauthenticateError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
      return 'Invalid password';

    case 'auth/user-not-found':
      return 'User not found';

    default:
      return 'An unexpected error occurred';
  }
}
