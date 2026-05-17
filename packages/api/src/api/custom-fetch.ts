// src/api/custom-fetch.ts

import {
  ACCESS_TOKEN_KEY,
  AuthError,
  clearTokens,
  getAuthGeneration,
  getToken,
  REFRESH_TOKEN_KEY,
  setTokens,
  shouldClearSessionOnAuthFailure,
} from './auth-storage';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

function resolveUrl(url: string): string {
  const base = getBaseUrl().replace(/\/$/, '');
  if (!url.startsWith('http')) return `${base}${url}`;
  return url.replace(/^https?:\/\/[^/]+/, base);
}

function normalizeHeaders(headers: HeadersInit | undefined): Record<string, string> {
  if (!headers) return {};

  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function attemptRefresh(): Promise<string | null> {
  const accessToken = getToken(ACCESS_TOKEN_KEY);
  const refreshToken = getToken(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) return null;

  const base = getBaseUrl().replace(/\/$/, '');
  const res = await fetch(`${base}/user/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
  });

  if (!res.ok) return null;

  const body = await res.json();
  const data = body?.data;
  if (!data?.access_token || !data?.refresh_token) return null;

  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

function failAuth(
  requestGeneration: number,
  hadToken: boolean,
  tokenUsed: string | null,
): never {
  if (shouldClearSessionOnAuthFailure(requestGeneration, hadToken, tokenUsed)) {
    clearTokens();
  }
  throw new AuthError();
}

async function handle401(
  finalUrl: string,
  options: RequestInit,
  buildHeaders: (t: string | null) => HeadersInit,
  hadToken: boolean,
  tokenUsed: string | null,
  requestGeneration: number,
): Promise<Response> {
  if (!hadToken) {
    failAuth(requestGeneration, false, null);
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
        failAuth(requestGeneration, true, tokenUsed);
      }

      return retryResponse;
    }

    refreshQueue.forEach((cb) => cb(''));
    refreshQueue = [];
    failAuth(requestGeneration, true, tokenUsed);
  }

  const newToken = await new Promise<string>((resolve) => {
    refreshQueue.push(resolve);
  });

  if (!newToken) {
    failAuth(requestGeneration, true, tokenUsed);
  }

  const retryResponse = await fetch(finalUrl, {
    ...options,
    headers: buildHeaders(newToken),
  });

  if (retryResponse.status === 401) {
    failAuth(requestGeneration, true, tokenUsed);
  }

  return retryResponse;
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const requestGeneration = getAuthGeneration();
  const finalUrl = resolveUrl(url);
  const token = getToken(ACCESS_TOKEN_KEY);
  const hadToken = !!token;

  const buildHeaders = (t: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...normalizeHeaders(options.headers),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  });

  let response = await fetch(finalUrl, {
    ...options,
    headers: buildHeaders(token),
  });

  if (response.status === 401) {
    response = await handle401(
      finalUrl,
      options,
      buildHeaders,
      hadToken,
      token,
      requestGeneration,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;

    if (response.status === 401 || response.status === 403) {
      if (shouldClearSessionOnAuthFailure(requestGeneration, hadToken, token)) {
        clearTokens();
      }
      throw new AuthError(
        typeof errorMessage === 'string' ? errorMessage : 'Session expired. Please log in again.',
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
