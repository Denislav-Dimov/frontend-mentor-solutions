import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  apiCommentSchema,
  apiHistoryItemSchema,
  apiUserSchema,
} from '../schemas';
import { ApiRequestError } from './errors';

const apiUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5217';

async function serverFetch(path: string, init?: RequestInit) {
  const cookieHeader = (await cookies()).toString();
  try {
    return await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { ...init?.headers, cookie: cookieHeader },
      cache: 'no-store',
    });
  } catch (error) {
    throw new ApiRequestError(`The API request failed for ${path}.`, path, undefined, {
      cause: error,
    });
  }
}

async function requireOk(response: Response, path: string) {
  if (!response.ok) {
    throw new ApiRequestError(
      `The API returned ${response.status} for ${path}.`,
      path,
      response.status,
    );
  }
}

export async function getCurrentUser() {
  const path = '/api/users/me';
  const response = await serverFetch(path);
  if (response.status === 401) return null;
  await requireOk(response, path);
  return apiUserSchema.parse(await response.json());
}

export async function getComments() {
  const path = '/api/comments';
  const response = await serverFetch(path);
  await requireOk(response, path);
  return z.array(apiCommentSchema).parse(await response.json());
}

export async function getHistory() {
  const path = '/api/comments/history';
  const response = await serverFetch(path);
  await requireOk(response, path);
  return z.array(apiHistoryItemSchema).parse(await response.json());
}
