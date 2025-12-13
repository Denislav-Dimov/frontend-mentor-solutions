export default function isValidEmail(email: string | undefined): boolean {
  if (!email) {
    return false;
  }

  if (email.includes(' ')) {
    return false;
  }

  const atIndex = email.indexOf('@');

  if (atIndex <= 0) {
    return false;
  }

  if (email.indexOf('@', atIndex + 1) !== -1) {
    return false;
  }

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (local === '' || domain === '') {
    return false;
  }

  if (!domain.includes('.')) {
    return false;
  }

  const dotIndex = domain.lastIndexOf('.');

  if (dotIndex === 0 || dotIndex === domain.length - 1) {
    return false;
  }

  return true;
}
