import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./constants";

/**
 * Set authentication tokens in both localStorage and cookies
 * Cookies are needed for middleware (server-side), localStorage for client-side API calls
 */
export function setAuthTokens(accessToken: string, refreshToken: string) {
    // Store in localStorage for client-side API calls
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

    // Store in cookies for middleware (server-side access)
    // Access token: 7 days
    document.cookie = `${ACCESS_TOKEN_KEY}=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    // Refresh token: 30 days
    document.cookie = `${REFRESH_TOKEN_KEY}=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

/**
 * Clear authentication tokens from both localStorage and cookies
 */
export function clearAuthTokens() {
    // Clear from localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Clear from cookies by setting max-age to 0
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}
