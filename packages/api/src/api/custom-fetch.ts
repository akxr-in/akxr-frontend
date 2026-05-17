// src/api/custom-fetch.ts

import {
  ACCESS_TOKEN_KEY,
  AuthError,
  clearTokens,
  getToken,
  REFRESH_TOKEN_KEY,
  setTokens,
} from './auth-storage';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

// Strip any hardcoded hostname (from orval codegen) and replace with runtime base URL.
// Handles: absolute URLs (http://localhost:3000/path) and relative URLs (/path).
function resolveUrl(url: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  // Relative path → prepend base. Absolute URL → swap origin with base.
  if (!url.startsWith('http')) return `${base}${url}`;
  return url.replace(/^https?:\/\/[^/]+/, base);
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function attemptRefresh(): Promise<string | null> {
  const refreshToken = getToken(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const base = getBaseUrl().replace(/\/$/, '');
  const res = await fetch(`${base}/user/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) return null;

  const body = await res.json();
  const data = body?.data;
  if (!data?.access_token || !data?.refresh_token) return null;

  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

function failAuth(): never {
  clearTokens();
  throw new AuthError();
}

async function handle401(
  finalUrl: string,
  options: RequestInit,
  buildHeaders: (t: string | null) => HeadersInit,
  hadToken: boolean,
): Promise<Response> {
  // No token was sent — refresh cannot help; clear stale cookies and stop.
  if (!hadToken) {
    failAuth();
  }

  if (!isRefreshing) {
    isRefreshing = true;
    const newToken = await attemptRefresh();
    isRefreshing = false;

    if (newToken) {
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      const retryResponse = await fetch(finalUrl, {
        ...options,
        headers: buildHeaders(newToken),
      });

      if (retryResponse.status === 401) {
        failAuth();
      }

      return retryResponse;
    }

    refreshQueue.forEach((cb) => cb(''));
    refreshQueue = [];
    failAuth();
  }

  const newToken = await new Promise<string>((resolve) => {
    refreshQueue.push(resolve);
  });

  if (!newToken) {
    failAuth();
  }

  const retryResponse = await fetch(finalUrl, {
    ...options,
    headers: buildHeaders(newToken),
  });

  if (retryResponse.status === 401) {
    failAuth();
  }

  return retryResponse;
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const finalUrl = resolveUrl(url);
  const token = getToken(ACCESS_TOKEN_KEY);
  const hadToken = !!token;

  const buildHeaders = (t: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...options.headers,
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  });

  let response = await fetch(finalUrl, {
    ...options,
    headers: buildHeaders(token),
  });

  if (response.status === 401) {
    response = await handle401(finalUrl, options, buildHeaders, hadToken);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    if (response.status === 401 || response.status === 403) {
      clearTokens();
      throw new AuthError(
        typeof errorMessage === 'string' ? errorMessage : 'Session expired. Please log in again.'
      );
    }
    throw new Error(errorMessage);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
