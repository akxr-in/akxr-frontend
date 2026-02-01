// src/api/custom-fetch.ts
export const customFetch = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Check if URL is already absolute (starts with http:// or https://)
  const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
  const finalUrl = isAbsoluteUrl ? url : `${baseUrl}${url}`;

  const response = await fetch(finalUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};