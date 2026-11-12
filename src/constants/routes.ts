export const AUTH_ROUTES = ['/login', '/register'] as const;

export const PROTECTED_CANDIDATE_ROUTES = [
  '/dashboard',
  '/profile',
  '/applications',
  '/documents',
  '/wallet',
  '/settings',
] as const;

export const ADMIN_ROUTE_PREFIX = '/admin';
export const ADMIN_API_PREFIX = '/api/admin';
export const AUTH_API_BASE = '/api/auth';
