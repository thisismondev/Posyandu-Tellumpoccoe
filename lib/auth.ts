import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Get current user from cookies and verify with Supabase
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token');
  const userId = cookieStore.get('user-id');

  if (!token || !userId) {
    return null;
  }

  try {
    // Verify token dengan Supabase
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token.value);

    if (authError || !userData.user) {
      return null;
    }

    // Get user profile dari database
    const { data: profile, error: profileError } = await supabaseAdmin.from('users').select('name, role').eq('id_users', userId.value).single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: userId.value,
      email: userData.user.email,
      name: profile.name,
      role: profile.role,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
