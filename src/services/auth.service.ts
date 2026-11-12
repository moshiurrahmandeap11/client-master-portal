import { authClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type {
  AdminSessionResponse,
  ApiResponse,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
  VerifyForgotPasswordOtpRequest,
  VerifyOtpRequest,
} from '@/types';

export const authService = {
  async getMe(): Promise<ApiResponse<AuthUser> & { authenticated?: boolean; isLoggedIn?: boolean; role?: string; user?: AuthUser }> {
    try {
      const response = await authClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getAdminSession(): Promise<AdminSessionResponse> {
    try {
      const response = await authClient.get<AdminSessionResponse>('/api/auth/me');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async refreshToken(): Promise<ApiResponse> {
    try {
      const response = await authClient.post<ApiResponse>('/api/auth/refresh-token');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response = await authClient.post<ApiResponse>('/api/auth/logout');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async verifyEmail(payload: VerifyOtpRequest): Promise<ApiResponse & { user?: AuthUser }> {
    try {
      const response = await authClient.post('/api/auth/verify-email', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async resendVerification(payload: ResendOtpRequest): Promise<ApiResponse & { devOtp?: string }> {
    try {
      const response = await authClient.post('/api/auth/resend-verification', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async requestForgotPasswordOtp(payload: ForgotPasswordRequest): Promise<ApiResponse & { maskedTarget?: string; testOtp?: string }> {
    try {
      const response = await authClient.post('/api/auth/forgot-password', {
        ...payload,
        action: 'request_otp',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async verifyForgotPasswordOtp(payload: VerifyForgotPasswordOtpRequest): Promise<ApiResponse> {
    try {
      const response = await authClient.post('/api/auth/forgot-password', {
        ...payload,
        action: 'verify_otp',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ApiResponse & { user?: AuthUser }> {
    try {
      const response = await authClient.post('/api/auth/forgot-password', {
        ...payload,
        action: 'reset_password',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ApiResponse> {
    try {
      const response = await authClient.post<ApiResponse>('/api/auth/change-password', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
