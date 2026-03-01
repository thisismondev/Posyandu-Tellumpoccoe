import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getEnv } from '@/lib/env';
import { createMiddlewareCookieHandler } from '@/lib/supabase/cookie-handler';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_KEY'), {
    cookies: createMiddlewareCookieHandler(request.cookies, response.cookies),
  });

  // Check session dan auto-refresh jika perlu
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Jika session expired, coba refresh
  if (session) {
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);

    // Refresh jika akan expired dalam 10 menit
    if (expiresAt && expiresAt - now < 600) {
      await supabase.auth.refreshSession();
    }
  }

  // Get user after potential refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect to login if no user
  if (!user && pathname === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if user is already logged in and trying to access login page
  if (user && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ['/', '/users/:path*', '/login', '/children/:path*'],
};
