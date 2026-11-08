import { antiforgerySchema, problemDetailsSchema } from '../schemas';
import { ApiRequestError } from './errors';

const ANTIFORGERY_PATH = '/api/security/antiforgery';
const ANTIFORGERY_FAILURE = 'A valid antiforgery token is required.';
const RATE_LIMIT_MESSAGE =
  'You are doing that too quickly. Please wait a moment and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export function resetAntiforgeryToken(): void {
  cachedToken = null;
  tokenPromise = null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

async function toApiError(response: Response, path: string): Promise<ApiRequestError> {
  const parsed = problemDetailsSchema.safeParse(await readJson(response));
  const problem = parsed.success ? parsed.data : {};
  const firstFieldError = problem.errors
    ? Object.values(problem.errors).flat().find(Boolean)
    : undefined;

  let message: string;
  if (response.status === 429) {
    message = problem.detail ?? RATE_LIMIT_MESSAGE;
  } else if (firstFieldError) {
    message = firstFieldError;
  } else {
    message = problem.detail ?? problem.title ?? problem.error ?? GENERIC_MESSAGE;
  }

  return new ApiRequestError(message, path, response.status, undefined, problem.errors);
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(path, { ...init, credentials: 'include' });
  } catch (error) {
    throw new ApiRequestError(
      'Unable to reach the server. Check your connection and try again.',
      path,
      undefined,
      { cause: error },
    );
  }
}

async function fetchToken(): Promise<string> {
  const response = await send(ANTIFORGERY_PATH);
  if (!response.ok) throw await toApiError(response, ANTIFORGERY_PATH);
  return antiforgerySchema.parse(await response.json()).token;
}

async function getToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) resetAntiforgeryToken();
  if (cachedToken) return cachedToken;

  if (!tokenPromise) {
    const request: Promise<string> = fetchToken()
      .then(token => {
        if (tokenPromise === request) cachedToken = token;
        return token;
      })
      .finally(() => {
        if (tokenPromise === request) tokenPromise = null;
      });
    tokenPromise = request;
  }

  return tokenPromise;
}

function withToken(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('X-XSRF-TOKEN', token);
  return { ...init, headers };
}

async function isAntiforgeryFailure(response: Response): Promise<boolean> {
  if (response.status !== 400) return false;
  const body = await readJson(response);
  return (
    typeof body === 'object' &&
    body !== null &&
    (body as { error?: unknown }).error === ANTIFORGERY_FAILURE
  );
}

export async function apiMutation(path: string, init?: RequestInit): Promise<Response> {
  let response = await send(path, withToken(init, await getToken()));

  if (await isAntiforgeryFailure(response)) {
    response = await send(path, withToken(init, await getToken(true)));
  }

  if (!response.ok) throw await toApiError(response, path);
  return response;
}
