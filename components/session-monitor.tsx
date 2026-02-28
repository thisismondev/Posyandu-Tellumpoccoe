'use client';

import { useSessionMonitor } from '@/hooks/use-session';

/**
 * Session Monitor Component
 * Auto-check session setiap 5 menit dan redirect ke login jika expired
 */
export function SessionMonitor() {
  useSessionMonitor();
  return null; // Component tidak render apa-apa
}
