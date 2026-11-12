import { authClient } from '@/lib/axios';
import { handleApiError } from '@/lib/api-error';
import type {
  AdminLoginRequest,
  ApiResponse,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/types';

export const loginService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.post<LoginResponse>('/api/auth/login', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await authClient.post<RegisterResponse>('/api/auth/register', payload);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async adminLogin(payload: AdminLoginRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.post<LoginResponse>('/api/auth/login', {
        ...payload,
        role: 'admin',
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async googleSignIn(credential: string): Promise<ApiResponse<{ user?: AuthUser }> & { user?: AuthUser }> {
    try {
      const response = await authClient.post<ApiResponse<{ user?: AuthUser }> & { user?: AuthUser }>(
        '/api/auth/social/google',
        { credential }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
