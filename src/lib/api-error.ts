import { AxiosError } from 'axios';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const extractErrorMessage = (error: unknown, fallback = 'কিছু একটা সমস্যা হয়েছে।'): string => {
  if (error instanceof ApiError) return error.message;

  if (error instanceof AxiosError) {
    const resData = error.response?.data as Record<string, any> | undefined;
    if (resData?.error && typeof resData.error === 'string') return resData.error;
    if (resData?.message && typeof resData.message === 'string') {
      if (Array.isArray(resData.errorSources) && resData.errorSources.length > 0) {
        const details = resData.errorSources
          .map((src: { path?: string; message?: string }) =>
            src.path && src.message ? `${src.path}: ${src.message}` : src.message || ''
          )
          .filter(Boolean)
          .join(' | ');
        if (details) return details;
      }
      return resData.message;
    }
    return error.message || fallback;
  }

  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = extractErrorMessage(error, 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে।');
    if (typeof window !== 'undefined' && status && status >= 500) {
      window.dispatchEvent(new CustomEvent('cs_api_error', { detail: { status, message } }));
    }
    throw new ApiError(message, status, error.response?.data);
  }

  const defaultMsg =
    error instanceof Error ? error.message : 'নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।';
  throw new ApiError(defaultMsg);
};
