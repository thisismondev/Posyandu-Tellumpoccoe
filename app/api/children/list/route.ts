import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET - List semua anak untuk dropdown Select
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('children').select('id, name, nik, birth').order('name', { ascending: true });

    if (error) {
      console.error('Error fetching children list:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
