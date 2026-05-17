// src/api/custom-fetch.ts

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

function getToken(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
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

export const customFetch = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const finalUrl = resolveUrl(url);
  const token = getToken(ACCESS_TOKEN_KEY);

  const buildHeaders = (t: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...options.headers,
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  });

  let response = await fetch(finalUrl, {
    ...options,
    headers: buildHeaders(token),
  });

  // Token refresh on 401
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await attemptRefresh();
      isRefreshing = false;

      if (newToken) {
        // Flush queued requests
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        // Retry this request with new token
        response = await fetch(finalUrl, {
          ...options,
          headers: buildHeaders(newToken),
        });
      } else {
        refreshQueue.forEach((cb) => cb(''));
        refreshQueue = [];
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      // Another refresh in progress — wait for it
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });

      if (!newToken) throw new Error('Session expired. Please log in again.');

      response = await fetch(finalUrl, {
        ...options,
        headers: buildHeaders(newToken),
      });
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
