import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query - ambil users dengan count children
    let query = supabaseAdmin
      .from('users')
      .select(
        `
        id_users,
        name,
        father_name,
        nik,
        kk,
        email,
        phone,
        address,
        created_at,
        role
      `,
        { count: 'exact' },
      )
      .eq('role', 'Parent'); // Filter hanya role Parent

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,father_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,nik.ilike.%${search}%`);
    }

    // Add sorting and pagination
    const { data: users, error, count } = await query.order(sortBy, { ascending: sortOrder === 'asc' }).range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ success: false, error: 'Gagal mengambil data users', details: error.message }, { status: 500 });
    }

    // Hitung jumlah anak untuk setiap user
    const usersWithChildrenCount = await Promise.all(
      (users || []).map(async (user) => {
        const { count: childrenCount } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('users_id', user.id_users);

        return {
          ...user,
          children_count: childrenCount || 0,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: usersWithChildrenCount,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
