// src/api/custom-fetch.ts
export const customFetch = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
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

  const data = await response.json();

  if (!response.ok) {
    // Try to extract error message from the response body
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    // Extract error message from common API error response formats
    errorMessage = data?.message || data?.error || errorMessage;

    throw new Error(errorMessage);
  }

  // Wrap the response to match the expected type structure
  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};