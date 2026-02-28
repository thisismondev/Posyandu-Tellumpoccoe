'use client';

/**
 * Client-side session monitor
 * Auto-refresh token sebelum expired dan redirect ke login jika gagal
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionMonitor() {
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data.valid) {
        // Session expired, redirect to login
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }, [router]);

  useEffect(() => {
    // Check session every 5 minutes
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // Check immediately on mount
    checkSession();

    return () => clearInterval(interval);
  }, [checkSession]);
}

/**
 * Hook untuk auto-logout on token expiry
 */
export function useAutoLogout() {
  const router = useRouter();

  useEffect(() => {
    // Listen untuk 401 responses (unauthorized)
    const handleUnauthorized = () => {
      router.push('/login');
      router.refresh();
    };

    // Bisa ditambahkan event listener atau axios interceptor di sini
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [router]);
}
