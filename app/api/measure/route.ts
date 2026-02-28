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
