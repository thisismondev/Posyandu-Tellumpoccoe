import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ChildrenResponse } from '@/types/child';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // JOIN query dengan users table
    let query = supabaseAdmin.from('children').select(
      `
        id,
        users_id,
        name,
        nik,
        gender,
        birth,
        heightCm,
        weightKg,
        headCm,
        child_no,
        created_at,
        users!inner (
          name,
          father_name
        )
      `,
      { count: 'exact' },
    );

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,nik.ilike.%${search}%`);
    }

    // Sorting
    const validSortFields = ['name', 'gender', 'birth', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: children, error, count } = await query;

    if (error) {
      console.error('Error fetching children:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch children data' }, { status: 500 });
    }

    // Transform data dan calculate age
    const childrenWithAge = (children || []).map((child: any) => {
      // Calculate umur (age) dalam tahun dan bulan
      let ageYears = 0;
      let ageMonths = 0;
      if (child.birth) {
        const birthDate = new Date(child.birth);
        const today = new Date();
        ageYears = today.getFullYear() - birthDate.getFullYear();
        ageMonths = today.getMonth() - birthDate.getMonth();

        if (ageMonths < 0) {
          ageYears--;
          ageMonths += 12;
        }

        if (today.getDate() < birthDate.getDate()) {
          ageMonths--;
          if (ageMonths < 0) {
            ageYears--;
            ageMonths += 12;
          }
        }
      }

      // Kembalikan gender asli dari database ('L' atau 'P')
      // Tidak perlu normalisasi karena frontend sudah handle format ini

      return {
        id: child.id,
        user_id: child.users_id,
        name: child.name,
        nik: child.nik,
        gender: child.gender,
        birth: child.birth,
        age: ageYears,
        ageMonths: ageMonths,
        parent_name: child.users?.name || null,
        father_name: child.users?.father_name || null,
        heightCm: child.heightCm,
        weightKg: child.weightKg,
        headCm: child.headCm,
        child_no: child.child_no,
        created_at: child.created_at,
      };
    });

    // Filter by parent name jika ada search
    let filteredChildren = childrenWithAge;
    if (search) {
      filteredChildren = childrenWithAge.filter((child) => {
        const searchLower = search.toLowerCase();
        return child.name?.toLowerCase().includes(searchLower) || child.nik?.toLowerCase().includes(searchLower) || child.parent_name?.toLowerCase().includes(searchLower) || child.father_name?.toLowerCase().includes(searchLower);
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const response: ChildrenResponse = {
      success: true,
      data: filteredChildren,
      total: count || 0,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/children:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      users_id,
      name,
      nik,
      gender,
      birth,
      height, // tinggi badan saat lahir/awal (opsional)
      weight, // berat badan saat lahir/awal (opsional)
      head, // lingkar kepala (opsional)
      child_no,
    } = body;

    // 1. Validasi Input Wajib
    if (!users_id || !name || !nik || !gender || !birth || !child_no) {
      return NextResponse.json({ success: false, error: 'Data wajib diisi: users_id, nama, nik, gender, tanggal lahir' }, { status: 400 });
    }

    // 2. Cek apakah Parent (users_id) valid
    const { data: parentExists, error: parentError } = await supabaseAdmin.from('users').select('id_users').eq('id_users', users_id).single();

    if (parentError || !parentExists) {
      return NextResponse.json({ success: false, error: 'ID Orang Tua tidak ditemukan' }, { status: 404 });
    }

    // 3. Cek NIK Unik (Optional - tapi disarankan)
    const { data: existingNik } = await supabaseAdmin.from('children').select('id').eq('nik', nik).single();

    if (existingNik) {
      return NextResponse.json({ success: false, error: 'NIK Anak sudah terdaftar' }, { status: 409 });
    }

    // 4. Insert ke database
    // Pastikan nama kolom sesuai dengan database Anda.
    // Berdasarkan GET code Anda: heightCm, weightKg, headCm.
    const { data: newChild, error: insertError } = await supabaseAdmin
      .from('children')
      .insert({
        users_id,
        name,
        nik,
        gender, // Pastikan formatnya sesuai (misal: 'L'/'P' atau 'Male'/'Female')
        birth,
        heightCm: height || 0,
        weightKg: weight || 0,
        headCm: head || 0,
        child_no: child_no || 1, // Anak ke-berapa
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating child:', insertError);
      return NextResponse.json({ success: false, error: 'Gagal menyimpan data anak: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Data anak berhasil ditambahkan',
        data: newChild,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/children:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
