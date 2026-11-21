import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/applications',
  '/documents',
  '/wallet',
  '/settings',
];

const AUTH_ROUTES = ['/login', '/register'];

function extractSetCookies(headers: Headers): string[] {
  const fromGetSetCookie = (headers as any).getSetCookie?.();
  if (Array.isArray(fromGetSetCookie) && fromGetSetCookie.length > 0) {
    return fromGetSetCookie;
  }
  const combined = headers.get('set-cookie');
  if (!combined) return [];
  // Split only at cookie boundaries, ignoring commas inside Expires=Wdy, DD Mon YYYY...
  return combined.split(/,(?=\s*[^;=]+=)/).map((c) => c.trim()).filter(Boolean);
}

async function fetchAuthStatus(request: NextRequest, backendUrl: string) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (!cookieHeader.includes('accessToken') && !cookieHeader.includes('cs_access_token') && !cookieHeader.includes('refreshToken') && !cookieHeader.includes('cs_refresh_token')) {
    return { authenticated: false as const };
  }

  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });

    if (!response.ok) {
      const refreshResponse = await fetch(`${backendUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        const newResponse = NextResponse.next();
        const setCookies = extractSetCookies(refreshResponse.headers);
        setCookies.forEach((cookie) => newResponse.headers.append('Set-Cookie', cookie));

        const data = await refreshResponse.json().catch(() => ({}));
        const role = (data?.role || data?.data?.role || data?.user?.role || 'candidate').toLowerCase();

        return {
          authenticated: true as const,
          refreshResponse: newResponse,
          setCookies,
          role,
        };
      }

      return { authenticated: false as const };
    }

    const data = await response.json().catch(() => ({}));
    const role = (data?.role || data?.data?.role || data?.user?.role || 'candidate').toLowerCase();
    return {
      authenticated: true as const,
      role,
    };
  } catch (err) {
    console.error('[middleware] Auth check network error:', err);
    return { authenticated: false as const };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = (process.env.INTERNAL_BACKEND_URL || 'http://localhost:6969').replace(/\/+$/, '');

  const staticFileExt = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|eot)$/;
  if (
    staticFileExt.test(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if (authStatus.authenticated && authStatus.role !== 'admin') {
      const targetUrl = new URL('/dashboard/profile', request.url);
      const redirect = NextResponse.redirect(targetUrl);
      if ('setCookies' in authStatus && authStatus.setCookies) {
        authStatus.setCookies.forEach((cookie) => redirect.headers.append('Set-Cookie', cookie));
      }
      return redirect;
    }
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if (!authStatus.authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if ('refreshResponse' in authStatus && authStatus.refreshResponse) {
      return authStatus.refreshResponse;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if ('refreshResponse' in authStatus && authStatus.refreshResponse) {
      return authStatus.refreshResponse;
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|uploads).*)'],
};
