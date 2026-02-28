import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/lib/env';

// Admin client dengan Service Role Key (bypass RLS)
export const supabaseAdmin = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
