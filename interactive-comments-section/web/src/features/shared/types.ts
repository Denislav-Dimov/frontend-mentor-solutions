import { z } from 'zod';
import {
  apiCommentSchema,
  apiHistoryItemSchema,
  apiUserSchema,
} from './schemas';

export type ApiUser = z.infer<typeof apiUserSchema>;

export type ApiComment = z.infer<typeof apiCommentSchema>;

export type ApiHistoryItem = z.infer<typeof apiHistoryItemSchema>;
