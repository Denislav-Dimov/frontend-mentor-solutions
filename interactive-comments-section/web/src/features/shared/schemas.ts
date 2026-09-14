import { z } from 'zod';

export const apiUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  avatarUrl: z.string(),
  isSeeded: z.boolean().optional().default(false),
});

export const apiCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  score: z.number(),
  createdAt: z.string(),
  author: apiUserSchema,
  parentId: z.string().nullable(),
  get replies() {
    return z.array(apiCommentSchema);
  },
  currentUserVote: z.number().nullable(),
});

export const apiHistoryItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.string(),
  parentId: z.string().nullable(),
  author: apiUserSchema,
});

export const apiUserListSchema = z.array(apiUserSchema);
