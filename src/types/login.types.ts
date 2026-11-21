export type AuthRole = 'candidate' | 'admin' | null;

export interface AuthState {
  isLoggedIn: boolean;
  role: AuthRole;
  name: string;
  phone?: string;
  email?: string;
  userId?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  phone?: string;
  role: 'candidate' | 'admin';
  emailVerified?: boolean;
  authProvider?: 'local' | 'google' | 'both';
  photoUrl?: string;
}

export interface LoginRequest {
  email: string;
  identifier?: string;
  password: string;
  rememberMe?: boolean;
  role?: 'candidate' | 'admin';
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
  user?: AuthUser;
}

export interface RegisterRequest {
  name: string;
  nameBn?: string;
  email: string;
  phone?: string;
  district?: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
  requiresVerification?: boolean;
  email?: string;
  devOtp?: string;
  user?: AuthUser;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose?: 'email_verify' | 'password_reset';
}

export interface ResendOtpRequest {
  email: string;
  purpose?: 'email_verify' | 'password_reset';
}

export interface ForgotPasswordRequest {
  identifier: string;
}

export interface VerifyForgotPasswordOtpRequest {
  identifier: string;
  otp: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface AdminLoginRequest {
  pin?: string;
  secretKey?: string;
  email?: string;
  password?: string;
}

export interface AdminSessionResponse {
  authenticated?: boolean;
  success?: boolean;
  user?: AuthUser;
  role?: string;
}
