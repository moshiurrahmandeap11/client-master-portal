import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { proxy } from './proxy';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle protected uploads rewrite
  if (/^\/uploads\/(candidate-documents|applicant-copies)\//.test(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = '/api' + pathname;
    return NextResponse.rewrite(target);
  }

  // Admin API Gate
  if (pathname.startsWith('/api/admin')) {
    const adminSecret = request.headers.get('x-admin-secret');
    const authHeader = request.headers.get('authorization');
    const accessToken = request.cookies.get('accessToken') || request.cookies.get('cs_access_token') || request.cookies.get('cs_session_token');
    const refreshToken = request.cookies.get('refreshToken') || request.cookies.get('cs_refresh_token');

    if (!adminSecret && !authHeader && !accessToken?.value) {
      if (refreshToken?.value) {
        return NextResponse.json(
          { error: 'UNAUTHORIZED: Access token expired' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'FORBIDDEN: Admin privileges required.' },
        { status: 403 }
      );
    }
  }

  // Execute Avirosoft-style proxy gate for silent session refresh & route protection
  return proxy(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)']
};
