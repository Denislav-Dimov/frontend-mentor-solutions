import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username must be 50 characters or fewer.'),
});

export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export function validateAvatar(file: File): string | null {
  if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
    return 'Choose a JPG, PNG, or WebP image.';
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Choose an image that is 2 MB or smaller.';
  }
  return null;
}
