import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Enterprise Axios Client for Chakri Sheba
 * Operates withCredentials: true so that httpOnly cookies (accessToken, refreshToken)
 * are automatically transmitted and set by the browser.
 * 
 * Features automatic silent token refresh on 401 errors:
 * When an access token expires (5m), it transparently calls /api/auth/refresh-token,
 * acquires fresh cookies, and retries the original request with zero user interruption.
 */

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue to hold failed requests while a token refresh is in flight
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Silent Refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't intercept auth routes (login, logout, refresh-token) to avoid infinite loops
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
        // Hit the refresh token endpoint
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
        // Dispatch auth logout event so UI can clean up if desired
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

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const exec = () =>
    fetch(url, {
      ...options,
      credentials: 'include'
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
        credentials: 'include'
      });
      if (refreshRes.ok) {
        res = await exec();
      }
    } catch {
      // Fall back to original 401 response
    }
  }
  return res;
}

export default axiosInstance;
export { axiosInstance };
