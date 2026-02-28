import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * PUT - Update Data Anak by ID
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Ambil field yang ingin diupdate
    // Kita filter hanya field yang diizinkan agar aman
    const { name, nik, gender, birth, height, weight, head, child_no } = body;

    // Validasi gender
    if (gender && gender !== 'L' && gender !== 'P') {
      return NextResponse.json({ success: false, error: 'Jenis kelamin harus L atau P' }, { status: 400 });
    }

    // 1. Cek apakah anak ada
    const { data: existingChild, error: checkError } = await supabaseAdmin.from('children').select('id').eq('id', id).single();

    if (checkError || !existingChild) {
      return NextResponse.json({ success: false, error: 'Data anak tidak ditemukan' }, { status: 404 });
    }

    // 2. Validasi NIK jika diubah (Cek duplikat NIK dengan ID berbeda)
    if (nik) {
      const { data: duplicateNik } = await supabaseAdmin
        .from('children')
        .select('id')
        .eq('nik', nik)
        .neq('id', id) // Kecuali punya diri sendiri
        .single();

      if (duplicateNik) {
        return NextResponse.json({ success: false, error: 'NIK sudah digunakan oleh data lain' }, { status: 409 });
      }
    }

    // 3. Prepare Update Data object
    const updateData: any = {};

    if (name) updateData.name = name;
    if (nik) updateData.nik = nik;
    if (gender) updateData.gender = gender;
    if (birth) updateData.birth = birth;
    if (height !== undefined) updateData.heightCm = height;
    if (weight !== undefined) updateData.weightKg = weight;
    if (head !== undefined) updateData.headCm = head;
    if (child_no !== undefined) updateData.child_no = child_no;

    // 4. Lakukan Update
    const { data: updatedChild, error: updateError } = await supabaseAdmin.from('children').update(updateData).eq('id', id).select().single();

    if (updateError) {
      console.error('Error updating child:', updateError);
      return NextResponse.json({ success: false, error: 'Gagal mengupdate data: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data anak berhasil diperbarui',
      data: updatedChild,
    });
  } catch (error) {
    console.error('Error in PUT /api/children/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * DELETE - Hapus Data Anak by ID
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Cek ketersediaan data
    const { data: existingChild, error: checkError } = await supabaseAdmin.from('children').select('id').eq('id', id).single();

    if (checkError || !existingChild) {
      return NextResponse.json({ success: false, error: 'Data anak tidak ditemukan' }, { status: 404 });
    }

    // 2. Hapus Riwayat Pengukuran (Cascade Manual jika perlu)
    // Jika di database foreign key 'result' -> 'children' diset CASCADE DELETE, langkah ini tidak perlu.
    // Tapi untuk keamanan, kita coba hapus manual atau cek error.

    /* 
    const { error: deleteMeasurementsError } = await supabaseAdmin
      .from('measurements') // Sesuaikan nama tabel pengukuran jika ada
      .delete()
      .eq('child_id', id);
      
    if (deleteMeasurementsError) {
       // Log error tapi mungkin tetap lanjut hapus anak tergantung kebijakan
       console.error('Warning deleting measurements:', deleteMeasurementsError);
    } 
    */

    // 3. Hapus Data Anak
    const { error: deleteError } = await supabaseAdmin.from('children').delete().eq('id', id);

    if (deleteError) {
      console.error('Error deleting child:', deleteError);
      return NextResponse.json({ success: false, error: 'Gagal menghapus data: ' + deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Data anak berhasil dihapus permanen',
    });
  } catch (error) {
    console.error('Error in DELETE /api/children/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
