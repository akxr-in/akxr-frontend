export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

/** Bumped on login/logout so stale in-flight 401s cannot wipe a new session. */
let authGeneration = 0;

export function getAuthGeneration(): number {
  return authGeneration;
}

const AUTH_ERROR_PATTERNS = [
  '401',
  '403',
  'Unauthorized',
  'Authorization header',
  'Token not found',
  'Session expired',
  'Invalid token',
] as const;

export function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return AUTH_ERROR_PATTERNS.some((pattern) => error.message.includes(pattern));
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function hasAuthToken(): boolean {
  return !!getToken(ACCESS_TOKEN_KEY);
}

/** Read token from localStorage, falling back to cookie (middleware may have set cookie only). */
export function getToken(key: string): string | null {
  if (typeof window === 'undefined') return null;

  const fromStorage = localStorage.getItem(key);
  if (fromStorage) return fromStorage;

  const fromCookie = getCookie(key);
  if (fromCookie) {
    localStorage.setItem(key, fromCookie);
    return fromCookie;
  }

  return null;
}

export function shouldClearSessionOnAuthFailure(
  requestGeneration: number,
  hadToken: boolean,
  tokenUsed: string | null,
): boolean {
  if (getAuthGeneration() !== requestGeneration) {
    // Login/logout happened while this request was in flight.
    return false;
  }

  const currentToken = getToken(ACCESS_TOKEN_KEY);

  if (!hadToken && currentToken) {
    // 401 from a pre-login request after tokens were stored.
    return false;
  }

  if (hadToken && currentToken && tokenUsed && currentToken !== tokenUsed) {
    // Token rotated (refresh/login) since this request was sent.
    return false;
  }

  return true;
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${ACCESS_TOKEN_KEY}=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${encodeURIComponent(refreshToken)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  authGeneration += 1;
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  authGeneration += 1;
}

export class AuthError extends Error {
  constructor(message = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'AuthError';
  }
}
