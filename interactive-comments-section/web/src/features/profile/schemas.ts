import { z } from 'zod';

export const profileSchema = z.object({
  username: z.string().trim().min(3).max(50),
});
