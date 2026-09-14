import { z } from 'zod';

export const voteSummarySchema = z.object({
  score: z.number(),
  upvoteCount: z.number(),
  downvoteCount: z.number(),
  currentUserVote: z.number().nullable(),
});

export const commentResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
});
