import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/env';
import { createCookieHandler } from './cookie-handler';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('NEXT_PUBLIC_SUPABASE_KEY'), {
    cookies: createCookieHandler(cookieStore),
  });
}
