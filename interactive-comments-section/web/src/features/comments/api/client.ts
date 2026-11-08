import { apiMutation } from '@/features/shared/api/client';
import { commentResponseSchema, voteSummarySchema } from '../schemas';

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function voteComment(id: string, value: 1 | -1) {
  const response = await apiMutation(`/api/comments/${id}/vote`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ value }),
  });
  return voteSummarySchema.parse(await response.json());
}

export async function createComment(content: string, parentId?: string) {
  const response = await apiMutation('/api/comments', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ content, parentId: parentId ?? null }),
  });
  return commentResponseSchema.parse(await response.json());
}

export async function deleteComment(id: string) {
  await apiMutation(`/api/comments/${id}`, { method: 'DELETE' });
}

export async function updateComment(id: string, content: string) {
  const response = await apiMutation(`/api/comments/${id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({ content }),
  });
  return commentResponseSchema.parse(await response.json());
}
