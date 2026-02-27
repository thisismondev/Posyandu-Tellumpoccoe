import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Refresh access token menggunakan refresh token
 */
async function refreshAccessToken(refreshToken: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Get current user dari cookies dan verify dengan Supabase Service Role
 * Auto refresh token jika expired
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  const userId = cookieStore.get('user-id')?.value;

  if (!accessToken || !userId) {
    return null;
  }

  try {
    // Verify token dengan Service Role
    let { data: userData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    // Jika token expired, coba refresh
    if (authError?.message?.includes('expired') || authError?.message?.includes('invalid')) {
      if (!refreshToken) {
        return null;
      }

      const newSession = await refreshAccessToken(refreshToken);
      
      if (!newSession) {
        // Clear cookies jika refresh gagal
        cookieStore.delete('sb-access-token');
        cookieStore.delete('sb-refresh-token');
        cookieStore.delete('user-id');
        return null;
      }

      // Verify dengan token baru
      const result = await supabaseAdmin.auth.getUser(newSession.access_token);
      userData = result.data;
      authError = result.error;
    }

    if (authError || !userData.user) {
      return null;
    }

    // Get user profile dari database menggunakan Service Role (bypass RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name, role')
      .eq('id_users', userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Validasi role admin
    if (profile.role !== 'Admin') {
      return null;
    }

    return {
      id: userId,
      email: userData.user.email,
      name: profile.name,
      role: profile.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
