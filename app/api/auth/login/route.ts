import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { ApiResponse } from '@/lib/api-response';
import { getEnv } from '@/lib/env';
import { createCookieHandler } from '@/lib/supabase/cookie-handler';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export async function POST(req: Request) {
  try {
    const body: LoginRequest = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return ApiResponse.badRequest('Email dan password wajib diisi');
    }

    const cookieStore = await cookies();

    // 🔹 Client untuk login (pakai ANON key)
    const supabase = createServerClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_KEY'), {
      cookies: createCookieHandler(cookieStore),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return ApiResponse.unauthorized('Email atau password salah');
    }

    // 🔹 Cek role pakai SERVICE ROLE
    const supabaseAdmin = createAdminClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

    const { data: profile, error: roleError } = await supabaseAdmin.from('users').select('role').eq('id_users', data.user.id).maybeSingle();

    if (roleError || !profile || profile.role !== 'Admin') {
      // ❌ Jika bukan admin → logout
      await supabase.auth.signOut();
      return ApiResponse.forbidden('Akses ditolak. Hanya Admin yang bisa login.');
    }

    const response: LoginResponse = {
      success: true,
      user: {
        email: data.user.email,
        role: profile.role,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponse.serverError('Terjadi kesalahan pada server');
  }
}
