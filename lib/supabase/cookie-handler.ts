import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

/**
 * Cookie handler untuk Supabase SSR di Next.js 15+
 * Digunakan untuk Route Handlers dan Server Actions
 */
export function createCookieHandler(cookieStore: ReadonlyRequestCookies) {
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch (error) {
        // Server Component context may not support set
        // This is expected in some contexts
      }
    },
  };
}

/**
 * Cookie handler untuk middleware
 * Menggunakan request dan response cookies
 */
export function createMiddlewareCookieHandler(
  requestCookies: {
    getAll: () => RequestCookie[];
  },
  responseCookies: {
    set: (name: string, value: string, options?: any) => void;
  },
) {
  return {
    getAll() {
      return requestCookies.getAll();
    },
    setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
      cookiesToSet.forEach(({ name, value, options }) => {
        responseCookies.set(name, value, options);
      });
    },
  };
}
