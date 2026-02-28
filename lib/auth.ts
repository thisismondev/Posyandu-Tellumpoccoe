import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabaseAdmin.from('users').select('name, role').eq('id_users', user.id).maybeSingle();

  if (!profile || profile.role !== 'Admin') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: profile.name,
    role: profile.role,
  };
}
