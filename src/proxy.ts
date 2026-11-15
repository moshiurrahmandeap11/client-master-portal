import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Route Proxy & Session Gate for Chakri Sheba
 * Strictly aligned with D:\avirosoft\aviro-auth-client architecture.
 *
 * Transparently inspects httpOnly session cookies via /api/auth/me.
 * On 401 (expired access token), silently hits /api/auth/refresh-token with cache: 'no-store',
 * attaches refreshed cookies directly to a NextResponse instance, and forwards it to the browser
 * maintaining continuous session persistence without logout.
 */

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/applications',
  '/documents',
  '/wallet',
  '/settings'
];

const AUTH_ROUTES = ['/login', '/register'];

async function fetchAuthStatus(request: NextRequest, backendUrl: string) {
  const cookieHeader = request.headers.get('cookie') || '';

  try {
    let response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: { Cookie: cookieHeader },
      cache: 'no-store',
    });

    // If /auth/me returns 401, attempt silent refresh like aviro-auth-client
    if (!response.ok) {
      const refreshResponse = await fetch(`${backendUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        // Refresh succeeded — forward new cookies directly to browser response
        const newResponse = NextResponse.next();
        const newCookies = (refreshResponse.headers as any).getSetCookie?.() || [];

        newCookies.forEach((cookie: string) => {
          newResponse.headers.append('Set-Cookie', cookie);
        });

        const setCookieHeader = refreshResponse.headers.get('set-cookie');
        if (setCookieHeader && newCookies.length === 0) {
          const cookies = setCookieHeader.split(',').map((c) => c.trim());
          cookies.forEach((cookie) => {
            newResponse.headers.append('Set-Cookie', cookie);
          });
        }

        const data = await refreshResponse.json().catch(() => ({}));
        const role = (data?.role || data?.data?.role || data?.user?.role || 'candidate').toLowerCase();

        return {
          authenticated: true as const,
          refreshResponse: newResponse,
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
    console.error('[proxy] Auth check network error:', err);
    return { authenticated: false as const };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = (process.env.INTERNAL_BACKEND_URL || 'http://localhost:6969').replace(/\/+$/, '');

  // 1. Skip static assets, APIs, and next internal files
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

  // 2. Auth routes (/login, /register): if already logged in → /dashboard (with refreshed cookies if any)
  if (isAuthRoute) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if (authStatus.authenticated && authStatus.role !== 'admin') {
      const targetUrl = new URL('/dashboard/profile', request.url);
      const redirect = NextResponse.redirect(targetUrl);
      if ('refreshResponse' in authStatus && authStatus.refreshResponse) {
        (authStatus.refreshResponse.headers as any).getSetCookie?.()?.forEach((cookie: string) => {
          redirect.headers.append('Set-Cookie', cookie);
        });
      }
      return redirect;
    }
    return NextResponse.next();
  }

  // 3. Protected routes: if not logged in → login, else allow and pipe refreshResponse
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

  // 4. Admin routes (/admin): allow access and forward refreshed cookies if refreshed
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
