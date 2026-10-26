'use client';

/**
 * Centrally managed administrative request headers for client components.
 * Authentication is strictly handled via httpOnly cookies (no localStorage or hardcoded secrets).
 */
export const getAdminHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json'
  };
};

export const ADMIN_REQ_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json'
};

/**
 * Pre-configured fetch wrapper for admin API endpoints that includes httpOnly cookies
 * and automatically refreshes the 5-minute accessToken on 401 via /api/auth/refresh-token.
 */
export async function fetchAdmin(url: string, options: RequestInit = {}): Promise<Response> {
  const exec = () =>
    fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...getAdminHeaders(),
        ...(options.headers || {})
      }
    });

  let res = await exec();
  if (res.status === 401) {
    try {
      const refreshRes = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include'
      });
      if (refreshRes.ok) {
        res = await exec();
      }
    } catch {
      // Ignore refresh network errors; original 401 will be returned
    }
  }
  return res;
}
