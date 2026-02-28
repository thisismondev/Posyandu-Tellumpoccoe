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

      // Normalize gender dari database (bisa 'L', 'P', 'male', 'female', atau 'laki-laki', 'perempuan')
      let normalizedGender: 'male' | 'female' = 'male';
      if (child.gender) {
        const genderLower = child.gender.toLowerCase();
        if (genderLower === 'p' || genderLower === 'female' || genderLower === 'perempuan') {
          normalizedGender = 'female';
        }
      }

      return {
        id: child.id,
        name: child.name,
        nik: child.nik,
        gender: normalizedGender,
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
