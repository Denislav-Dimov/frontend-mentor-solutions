import isValidEmail from '../../../utils/isValidEmail';

export function validateEmail(email: string) {
  if (!email) return 'Enter an email';

  if (!isValidEmail(email)) return 'Enter a valid email';

  return '';
}

export function validatePassword(password: string) {
  if (!password) return 'Enter a password';

  if (password.length < 6) return 'Password must be at least 6 characters';

  return '';
}

export function validateConfirmPassword(password: string, confirmPassword: string) {
  if (!password) return 'Enter a password';

  if (password !== confirmPassword) return 'Confirm password must match the password';

  return '';
}
