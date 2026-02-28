/**
 * Session utilities untuk handling expired tokens
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Check apakah session masih valid
 * Returns user jika valid, null jika expired
 */
export async function validateSession() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return { valid: false, user: null, session: null };
    }

    // Check if token is expired
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt && expiresAt < now) {
      // Try to refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !refreshData.session) {
        return { valid: false, user: null, session: null };
      }

      return {
        valid: true,
        user: refreshData.user,
        session: refreshData.session,
      };
    }

    return {
      valid: true,
      user: session.user,
      session,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { valid: false, user: null, session: null };
  }
}

/**
 * Get session expiry time in milliseconds
 */
export function getSessionExpiryTime(session: any): number | null {
  if (!session?.expires_at) return null;
  return session.expires_at * 1000; // Convert to milliseconds
}

/**
 * Check if session will expire soon (dalam 5 menit)
 */
export function isSessionExpiringSoon(session: any): boolean {
  const expiryTime = getSessionExpiryTime(session);
  if (!expiryTime) return false;

  const fiveMinutes = 5 * 60 * 1000;
  const now = Date.now();

  return expiryTime - now < fiveMinutes;
}
