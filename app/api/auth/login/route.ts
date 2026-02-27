import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validasi input
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    // 1. Login dengan Service Role Key
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const userId = authData.user.id;

    // 2. Cek role di tabel users
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name, role')
      .eq('id_users', userId)
      .single();

    if (profileError || !profile) {
      // Sign out jika profile tidak ditemukan
      await supabaseAdmin.auth.signOut();
      return NextResponse.json({ error: 'Profile tidak ditemukan' }, { status: 404 });
    }

    // 3. Validasi role admin
    if (profile.role !== 'Admin') {
      await supabaseAdmin.auth.signOut();
      return NextResponse.json({ error: 'Akses ditolak. Hanya admin yang dapat login.' }, { status: 403 });
    }

    // 4. Set session di cookies
    const cookieStore = await cookies();

    cookieStore.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('sb-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('user-id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
        name: profile.name,
        role: profile.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
