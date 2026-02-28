import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * PUT - Update Data Pengukuran by ID
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Destructuring hanya field yang boleh diubah
    const { measured_at, heightCm, weightKg, headCm, armCm } = body;

    // 1. Cek User ID / Child ID (Biasanya tidak boleh ubah anak, tapi tanggal boleh)

    // 2. Prepare Update Data
    const updateData: any = {};

    if (measured_at) updateData.measured_at = measured_at;
    if (heightCm !== undefined) updateData.heightCm = heightCm;
    if (weightKg !== undefined) updateData.weightKg = weightKg;
    if (headCm !== undefined) updateData.headCm = headCm;
    if (armCm !== undefined) updateData.armCm = armCm;

    // 3. Update Database
    const { data: updatedMeasure, error: updateError } = await supabaseAdmin.from('measurements').update(updateData).eq('id', id).select().single();

    if (updateError) {
      console.error('Error updating measurement:', updateError);
      return NextResponse.json({ success: false, error: 'Gagal update data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data pengukuran berhasil diperbarui',
      data: updatedMeasure,
    });
  } catch (error) {
    console.error('Error in PUT /api/measure/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * DELETE - Hapus Data Pengukuran by ID
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { error: deleteError } = await supabaseAdmin.from('measurements').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting measurement:', deleteError);
      return NextResponse.json({ success: false, error: 'Gagal menghapus data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data pengukuran berhasil dihapus',
    });
  } catch (error) {
    console.error('Error in DELETE /api/measure/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
