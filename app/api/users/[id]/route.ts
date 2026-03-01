import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * GET - Get single user by ID
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Ambil data user
    const { data: user, error } = await supabaseAdmin.from('users').select('*').eq('id_users', id).eq('role', 'Parent').single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Hitung jumlah anak
    const { count } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('users_id', id);

    return NextResponse.json({
      success: true,
      data: { ...user, children_count: count || 0 },
    });
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * PUT - Update user
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, father_name, nik, kk, phone, address, email, password } = body;

    // Validasi
    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 });
    }

    // Cek apakah user exists
    const { data: existing, error: checkError } = await supabaseAdmin.from('users').select('id_users, email, nik, is_example_email, is_whitout_nik').eq('id_users', id).eq('role', 'Parent').single();

    if (checkError || !existing) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Validasi untuk is_example_email dan is_whitout_nik
    if (existing.is_example_email && (!email || email === existing.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'User wajib mengganti email dengan email asli',
        },
        { status: 400 },
      );
    }

    if (existing.is_whitout_nik && (!nik || nik === existing.nik)) {
      return NextResponse.json(
        {
          success: false,
          error: 'User wajib mengisi NIK asli',
        },
        { status: 400 },
      );
    }

    // Update di Supabase Auth jika ada perubahan email atau password
    if (email && email !== existing.email) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });
      if (authError) {
        console.error('Error updating auth email:', authError);
        return NextResponse.json({ success: false, error: 'Gagal update email: ' + authError.message }, { status: 500 });
      }
    }

    if (password && password.length >= 6) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { password });
      if (authError) {
        console.error('Error updating auth password:', authError);
        return NextResponse.json({ success: false, error: 'Gagal update password: ' + authError.message }, { status: 500 });
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      father_name: father_name || null,
      nik: nik || null,
      kk: kk || null,
      phone: phone || null,
      address: address || null,
      ...(email && { email }),
    };

    // Set is_example_email ke false jika email diganti
    if (existing.is_example_email && email && email !== existing.email) {
      updateData.is_example_email = false;
    }

    // Set is_whitout_nik ke false jika NIK diisi
    if (existing.is_whitout_nik && nik && nik !== existing.nik) {
      updateData.is_whitout_nik = false;
    }

    // Update data di tabel users
    const { data: updated, error: updateError } = await supabaseAdmin.from('users').update(updateData).eq('id_users', id).select().single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ success: false, error: 'Gagal update profil: ' + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      data: updated,
    });
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * DELETE - Delete user
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 1. Cek apakah user exists
    const { data: existing, error: checkError } = await supabaseAdmin.from('users').select('id_users').eq('id_users', id).eq('role', 'Parent').single();

    if (checkError || !existing) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // 2. Ambil semua children_id yang terkait dengan user ini
    const { data: children, error: childrenError } = await supabaseAdmin.from('children').select('id').eq('users_id', id);

    if (childrenError) {
      console.error('Error fetching children:', childrenError);
      return NextResponse.json({ success: false, error: 'Gagal mengambil data anak: ' + childrenError.message }, { status: 500 });
    }

    // 3. Jika ada anak, hapus semua measurements yang terkait
    if (children && children.length > 0) {
      const childrenIds = children.map((child) => child.id);

      const { error: deleteMeasurementsError } = await supabaseAdmin.from('measurements').delete().in('children_id', childrenIds);

      if (deleteMeasurementsError) {
        console.error('Error deleting measurements:', deleteMeasurementsError);
        return NextResponse.json({ success: false, error: 'Gagal menghapus data pengukuran: ' + deleteMeasurementsError.message }, { status: 500 });
      }
    }

    // 4. Hapus semua children yang terkait dengan user
    const { error: deleteChildrenError } = await supabaseAdmin.from('children').delete().eq('users_id', id);

    if (deleteChildrenError) {
      console.error('Error deleting children:', deleteChildrenError);
      return NextResponse.json({ success: false, error: 'Gagal menghapus data anak: ' + deleteChildrenError.message }, { status: 500 });
    }

    // 5. Hapus user dari tabel users
    const { error: deleteUserError } = await supabaseAdmin.from('users').delete().eq('id_users', id);

    if (deleteUserError) {
      console.error('Error deleting user profile:', deleteUserError);
      return NextResponse.json({ success: false, error: 'Gagal menghapus profil user: ' + deleteUserError.message }, { status: 500 });
    }

    // 6. Hapus akun dari Supabase Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      // Opsional: Return warning, tapi karena data di DB sudah bersih, anggap sukses dengan catatan log
    }

    return NextResponse.json({
      success: true,
      message: 'User, anak, dan semua data pengukuran berhasil dihapus',
    });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
