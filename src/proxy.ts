import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Route Proxy & Session Gate for Chakri Sheba
 * Modeled after Avirosoft Client Proxy architecture.
 * 
 * Transparently inspects httpOnly session cookies via /api/auth/me.
 * On 401 (expired 5m access token), silently hits /api/auth/refresh-token,
 * captures refreshed cookies, appends them to the outgoing browser response,
 * and maintains seamless access without user disruption or visible reload.
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
    });

    // If /auth/me returns 401, attempt silent refresh
    if (!response.ok) {
      const refreshResponse = await fetch(`${backendUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
      });

      if (refreshResponse.ok) {
        // Refresh succeeded — capture fresh Set-Cookie headers to forward to browser
        const cookiesToSet: string[] = [];
        const newCookies = (refreshResponse.headers as any).getSetCookie?.() || [];

        if (newCookies.length > 0) {
          cookiesToSet.push(...newCookies);
        } else {
          const setCookieHeader = refreshResponse.headers.get('set-cookie');
          if (setCookieHeader) {
            cookiesToSet.push(...setCookieHeader.split(/,(?=\s*[^;]+=)/).map(c => c.trim()));
          }
        }

        const data = await refreshResponse.json().catch(() => ({}));
        return {
          authenticated: true as const,
          role: data?.role || 'candidate',
          cookiesToSet
        };
      }

      return { authenticated: false as const };
    }

    const data = await response.json().catch(() => ({}));
    return { 
      authenticated: true as const, 
      role: data?.role || 'candidate' 
    };
  } catch (err) {
    console.error('[proxy] Auth check network error:', err);
    return { authenticated: false as const };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:6969';

  // 1. Skip static assets, APIs, and next internal files
  const staticFileExt = /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf|eot)$/;
  if (staticFileExt.test(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/uploads')) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // 2. Auth Routes (/login, /register): if already logged in as candidate, redirect to /dashboard
  if (isAuthRoute) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if (authStatus.authenticated && authStatus.role !== 'admin') {
      const targetUrl = new URL('/dashboard', request.url);
      const redirect = NextResponse.redirect(targetUrl);
      if ('cookiesToSet' in authStatus && authStatus.cookiesToSet?.length) {
        authStatus.cookiesToSet.forEach(cookie => redirect.headers.append('Set-Cookie', cookie));
      }
      return redirect;
    }
    return NextResponse.next();
  }

  // 3. Protected Candidate Routes (/dashboard, /applications, etc.)
  if (isProtectedRoute) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    if (!authStatus.authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const res = NextResponse.next();
    if ('cookiesToSet' in authStatus && authStatus.cookiesToSet?.length) {
      authStatus.cookiesToSet.forEach(cookie => res.headers.append('Set-Cookie', cookie));
    }
    return res;
  }

  // 4. Admin Portal (/admin)
  // Let the request through; if user has verified admin cookie it automatically logs in,
  // otherwise the secure PIN console is displayed.
  if (pathname.startsWith('/admin')) {
    const authStatus = await fetchAuthStatus(request, backendUrl);
    const res = NextResponse.next();
    if ('cookiesToSet' in authStatus && authStatus.cookiesToSet?.length) {
      authStatus.cookiesToSet.forEach(cookie => res.headers.append('Set-Cookie', cookie));
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|uploads).*)'],
};
