import { antiforgerySchema } from '@/features/auth/schemas';
import { ApiRequestError } from '@/features/shared/api/errors';
import { commentResponseSchema, voteSummarySchema } from '../schemas';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5217';

const RATE_LIMIT_MESSAGE =
  'You are doing that too quickly. Please wait a moment and try again.';

let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

async function requestToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken) {
    return cachedToken;
  }

  if (!forceRefresh && tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    const response = await fetch(`${apiUrl}/api/security/antiforgery`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new ApiRequestError(
        response.status === 429 ? RATE_LIMIT_MESSAGE : 'Unable to prepare this request.',
        '/api/security/antiforgery',
        response.status,
      );
    }
    const token = antiforgerySchema.parse(await response.json()).token;
    cachedToken = token;
    return token;
  })();
  try {
    return await tokenPromise;
  } catch (error) {
    cachedToken = null;
    throw error;
  } finally {
    tokenPromise = null;
  }
}

function isAntiforgeryFailure(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  return (
    'error' in body &&
    (body as { error?: unknown }).error === 'A valid antiforgery token is required.'
  );
}

async function sendMutation(path: string, init: RequestInit, token: string) {
  try {
    return await fetch(`${apiUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...init.headers,
        'X-XSRF-TOKEN': token,
      },
    });
  } catch (error) {
    throw new ApiRequestError(`The API request failed for ${path}.`, path, undefined, {
      cause: error,
    });
  }
}

function throwForStatus(response: Response, path: string): never {
  throw new ApiRequestError(
    response.status === 429
      ? RATE_LIMIT_MESSAGE
      : `The API returned ${response.status} for ${path}.`,
    path,
    response.status,
  );
}

async function mutation(path: string, init: RequestInit) {
  const token = await requestToken();
  let response = await sendMutation(path, init, token);
  if (response.status === 400) {
    let body: unknown = null;
    try {
      body = await response.clone().json();
    } catch {
      body = null;
    }
    if (isAntiforgeryFailure(body)) {
      cachedToken = null;
      const freshToken = await requestToken(true);
      response = await sendMutation(path, init, freshToken);
    }
  }

  if (!response.ok) {
    throwForStatus(response, path);
  }

  return response;
}

export async function voteComment(id: string, value: 1 | -1) {
  const response = await mutation(`/api/comments/${id}/vote`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
  return voteSummarySchema.parse(await response.json());
}

export async function createComment(content: string, parentId?: string) {
  const response = await mutation('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, parentId: parentId ?? null }),
  });
  return commentResponseSchema.parse(await response.json());
}

export async function deleteComment(id: string) {
  await mutation(`/api/comments/${id}`, { method: 'DELETE' });
}

export async function updateComment(id: string, content: string) {
  const response = await mutation(`/api/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  return commentResponseSchema.parse(await response.json());
}
