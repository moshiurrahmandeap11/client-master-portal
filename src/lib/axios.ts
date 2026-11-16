import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Enterprise Axios Client for Chakri Sheba (modeled after Aviro Pulse).
 * Operates with withCredentials: true so httpOnly cookies (accessToken, refreshToken)
 * are automatically transmitted and managed by the browser.
 *
 * Features transparent silent token refresh on 401:
 * When the 5-minute accessToken expires, concurrently queued requests wait while
 * /api/auth/refresh-token issues fresh httpOnly cookies, then retry seamlessly.
 */

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authClient = axiosInstance;
export const apiClient = axiosInstance;

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    const requestUrl = originalRequest?.url || '';
    const isAuthRoute =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/refresh-token') ||
      requestUrl.includes('/api/auth/logout') ||
      requestUrl.includes('/api/auth/register');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          '/api/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        if (refreshRes.status === 200 && refreshRes.data?.success) {
          processQueue(null);
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Session refresh failed'));
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cs_auth_unauthorized'));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Cookie-authenticated fetch wrapper for multipart/FormData uploads and streaming endpoints
 * with transparent 401 token refresh fallback.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const exec = () =>
    fetch(url, {
      ...options,
      credentials: 'include',
    });

  let res = await exec();
  const isAuthRoute =
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/refresh-token') ||
    url.includes('/api/auth/logout') ||
    url.includes('/api/auth/register');

  if (res.status === 401 && !isAuthRoute) {
    try {
      const refreshRes = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        res = await exec();
      }
    } catch {
      // Return original 401 if refresh network request fails
    }
  }
  return res;
}

export const getAdminHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-admin-secret': '1234',
  };
  if (typeof window !== 'undefined') {
    const storedSecret = localStorage.getItem('cs_admin_secret') || 
                         localStorage.getItem('adminSecret') || 
                         localStorage.getItem('admin_secret');
    if (storedSecret) {
      headers['x-admin-secret'] = storedSecret;
    }
    const token = localStorage.getItem('cs_access_token') || localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const ADMIN_REQ_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-admin-secret': '1234',
};

/**
 * Cookie-authenticated fetch wrapper for admin endpoints.
 */
export async function fetchAdmin(url: string, options: RequestInit = {}): Promise<Response> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  return fetchWithAuth(url, {
    ...options,
    headers: isFormData
      ? options.headers
      : {
          ...getAdminHeaders(),
          ...(options.headers || {}),
        },
  });
}

export default axiosInstance;
