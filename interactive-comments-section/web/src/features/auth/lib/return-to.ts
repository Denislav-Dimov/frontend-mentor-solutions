export function getSafeReturnTo(value: unknown): string {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  // Browsers treat "\" as "/" and strip tabs/newlines, so "/\evil.com" or "/\t/evil.com" leave the site.
  const hasUnsafeChar = [...value].some(
    char => char === '\\' || char.charCodeAt(0) < 0x20 || char === '\x7f',
  );
  return hasUnsafeChar ? '/' : value;
}
