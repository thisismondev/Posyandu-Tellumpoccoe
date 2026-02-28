import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ApiResponse } from '@/lib/api-response';
import { getEnv } from '@/lib/env';
import { createCookieHandler } from '@/lib/supabase/cookie-handler';
import type { LogoutResponse } from '@/types/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_KEY'), {
      cookies: createCookieHandler(cookieStore),
    });

    await supabase.auth.signOut();

    const response: LogoutResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Logout error:', error);
    return ApiResponse.serverError('Terjadi kesalahan saat logout');
  }
}
