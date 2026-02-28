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

/**
 * POST - Create new user (keluarga)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, father_name, nik, kk, phone, address } = body;

    // Validasi input
    if (!email || !password || !name || !nik) {
      return NextResponse.json({ success: false, error: 'Email, password, Nik dan nama wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // 1. Buat user di Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ success: false, error: 'Gagal membuat akun: ' + authError?.message }, { status: 500 });
    }

    // 2. Insert data ke tabel users
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id_users: authUser.user.id,
        email,
        name,
        father_name: father_name || null,
        nik: nik || null,
        kk: kk || null,
        phone: phone || null,
        address: address || null,
        role: 'Parent',
      })
      .select()
      .single();

    if (insertError) {
      // Rollback: hapus user dari auth jika insert gagal
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      console.error('Error inserting user profile:', insertError);
      return NextResponse.json({ success: false, error: 'Gagal menyimpan data profil: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User berhasil ditambahkan',
        data: { ...newUser, children_count: 0 },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
