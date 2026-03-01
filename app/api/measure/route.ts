import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MeasurementsResponse } from '@/types/measure';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'measured_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const month = searchParams.get('month') || '';
    const year = searchParams.get('year') || '';

    const offset = (page - 1) * limit;

    // JOIN query dengan children table
    let query = supabaseAdmin.from('measurements').select(
      `
        id,
        children_id,
        measured_at,
        heightCm,
        weightKg,
        headCm,
        armCm,
        children!inner (
          name,
          birth
        )
      `,
      { count: 'exact' },
    );

    // Search filter (untuk nama anak)
    if (search) {
      query = query.or(`children.name.ilike.%${search}%`);
    }

    // Filter by month and year
    if (month && year) {
      // Filter untuk bulan dan tahun spesifik
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      // Hitung hari terakhir bulan
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      query = query.gte('measured_at', startDate).lte('measured_at', endDate);
    } else if (year) {
      // Filter hanya tahun
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('measured_at', startDate).lte('measured_at', endDate);
    }

    // Sorting
    const validSortFields = ['measured_at', 'heightCm', 'weightKg', 'headCm', 'armCm'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'measured_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: measurements, error, count } = await query;

    if (error) {
      console.error('Error fetching measure:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch measurements data' }, { status: 500 });
    }

    // Transform data dan calculate age in months
    const measurementsWithAge = (measurements || []).map((measurement: any) => {
      // Calculate usia dalam bulan pada saat pengukuran
      let ageMonths = 0;
      if (measurement.children?.birth && measurement.measured_at) {
        const birthDate = new Date(measurement.children.birth);
        const measureDate = new Date(measurement.measured_at);

        const years = measureDate.getFullYear() - birthDate.getFullYear();
        const months = measureDate.getMonth() - birthDate.getMonth();
        ageMonths = years * 12 + months;

        // Adjust jika tanggal belum lewat
        if (measureDate.getDate() < birthDate.getDate()) {
          ageMonths--;
        }
      }

      return {
        id: measurement.id,
        children_id: measurement.children_id,
        measured_at: measurement.measured_at,
        child_name: measurement.children?.name || null,
        child_birth: measurement.children?.birth || null,
        age_months: ageMonths,
        heightCm: measurement.heightCm,
        weightKg: measurement.weightKg,
        headCm: measurement.headCm,
        armCm: measurement.armCm,
      };
    });

    // Filter by child name jika ada search
    let filteredMeasurements = measurementsWithAge;
    if (search) {
      filteredMeasurements = measurementsWithAge.filter((measurement) => {
        const searchLower = search.toLowerCase();
        return measurement.child_name?.toLowerCase().includes(searchLower);
      });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    const response: MeasurementsResponse = {
      success: true,
      data: filteredMeasurements,
      total: count || 0,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/measure:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST - Tambah Data Pengukuran Baru
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { children_id, measured_at, heightCm, weightKg, headCm, armCm } = body;

    // 1. Validasi Input Wajib
    if (!children_id || !measured_at) {
      return NextResponse.json({ success: false, error: 'Data wajib diisi: Nama Anak dan Tanggal Pengukuran' }, { status: 400 });
    }

    // 2. Insert ke database
    const { data: newMeasure, error: insertError } = await supabaseAdmin
      .from('measurements')
      .insert({
        children_id,
        measured_at, // Format: YYYY-MM-DD
        heightCm: heightCm || 0,
        weightKg: weightKg || 0,
        headCm: headCm || 0,
        armCm: armCm || 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating measurement:', insertError);
      return NextResponse.json({ success: false, error: 'Gagal menyimpan data: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Data pengukuran berhasil ditambahkan',
        data: newMeasure,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/measure:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
