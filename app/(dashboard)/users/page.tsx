'use client';

import { useState, useEffect } from 'react';
import { Parent } from '@/types/parent';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<Parent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Parent | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Form state untuk Add
  const [addForm, setAddForm] = useState({
    name: '',
    father_name: '',
    nik: '',
    kk: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });

  // Form state untuk Edit
  const [editForm, setEditForm] = useState({
    name: '',
    father_name: '',
    nik: '',
    kk: '',
    email: '',
    phone: '',
    address: '',
  });

  // Helper function untuk capitalize nama
  const capitalizeName = (name: string | null): string => {
    if (!name) return '-';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch users dari API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, rowsPerPage, searchTerm, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage,
        sortBy: sortField,
        sortOrder: sortDirection,
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data');
      }

      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data keluarga ini? Semua data anak terkait juga akan terhapus permanen.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus user');
      }

      alert('Data keluarga berhasil dihapus');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus data');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menambahkan user');
      }

      alert('User berhasil ditambahkan!');
      setIsAddDialogOpen(false);

      // Reset form
      setAddForm({
        name: '',
        father_name: '',
        nik: '',
        kk: '',
        email: '',
        phone: '',
        address: '',
        password: '',
      });

      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (userId: string) => {
    setSelectedUserId(userId);
    setIsSheetOpen(true);
    setIsLoadingDetail(true);
    setSelectedUser(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil detail user');
      }

      setSelectedUser(data.data);

      // Set form edit dengan data yang diambil
      setEditForm({
        name: data.data.name || '',
        father_name: data.data.father_name || '',
        nik: data.data.nik || '',
        kk: data.data.kk || '',
        email: data.data.email || '',
        phone: data.data.phone || '',
        address: data.data.address || '',
      });
    } catch (err) {
      console.error('Error fetching user detail:', err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setIsSheetOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handler untuk Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/users/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui user');
      }

      alert('Data keluarga berhasil diperbarui!');
      setIsSheetOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6 min-h-screen">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manajemen Keluarga</h1>
            <p className="text-neutral-600 mt-1">Kelola data keluarga dan kepala keluarga terdaftar</p>
          </div>
        </div>

        {/* Table Card */}
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-neutral-900">Daftar Keluarga</CardTitle>
                <CardDescription>Kelola dan monitor data keluarga terdaftar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Input placeholder="Cari nama, email, phone..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />
                <Select value={rowsPerPage} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tampilkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Tambah Keluarga
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-neutral-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('name')}>
                      Nama Keluarga {getSortIcon('name')}
                    </TableHead>
                    <TableHead>Data Keluarga</TableHead>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('email')}>
                      Kontak {getSortIcon('email')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('address')}>
                      Alamat {getSortIcon('address')}
                    </TableHead>
                    <TableHead className="text-center">Jumlah Anak</TableHead>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('created_at')}>
                      Tanggal Daftar {getSortIcon('created_at')}
                    </TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-500" />
                        <p className="text-sm text-neutral-500 mt-2">Memuat data...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-500">
                        Error: {error}
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const date = new Date(user.created_at);
                      const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                      return (
                        <TableRow key={user.id_users}>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">{capitalizeName(user.name)}</div>
                              <div className="text-xs text-neutral-500">{capitalizeName(user.father_name)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-xs text-neutral-500">NIK: {user.nik || '-'}</div>
                              <div className="text-xs text-neutral-500">KK: {user.kk || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{user.email || '-'}</div>
                              <div className="text-neutral-500">{user.phone || '-'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-[200px] line-clamp-2 truncate">{capitalizeName(user.address) || '-'}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-semibold">
                              {user.children_count}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formattedDate}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button> */}
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(user.id_users)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(user.id_users)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                Menampilkan {users.length > 0 ? (currentPage - 1) * parseInt(rowsPerPage) + 1 : 0}-{Math.min(currentPage * parseInt(rowsPerPage), total)} dari {total} data
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="h-8 w-8 p-0">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(page)} disabled={isLoading} className="h-8 w-8 p-0">
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-1 text-neutral-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="h-8 w-8 p-0">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Data Keluarga Baru</DialogTitle>
            <DialogDescription>Masukkan informasi data keluarga baru. Pastikan semua data yang wajib diisi sudah terisi dengan benar.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right">
                  Nama Ibu <span className="text-red-500">*</span>
                </Label>
                <Input id="add-name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="col-span-3" placeholder="Masukkan nama kepala keluarga" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-father" className="text-right">
                  Nama Ayah
                </Label>
                <Input id="add-father" value={addForm.father_name} onChange={(e) => setAddForm({ ...addForm, father_name: e.target.value })} className="col-span-3" placeholder="Masukkan nama ayah" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-nik" className="text-right">
                  NIK
                </Label>
                <Input id="add-nik" value={addForm.nik} onChange={(e) => setAddForm({ ...addForm, nik: e.target.value })} className="col-span-3" placeholder="Masukkan NIK" maxLength={16} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-kk" className="text-right">
                  No. KK
                </Label>
                <Input id="add-kk" value={addForm.kk} onChange={(e) => setAddForm({ ...addForm, kk: e.target.value })} className="col-span-3" placeholder="Masukkan nomor KK" maxLength={16} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-email" className="text-right">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="col-span-3" placeholder="contoh@email.com" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-password" className="text-right">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input id="add-password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="col-span-3" placeholder="Minimal 6 karakter" required minLength={6} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-phone" className="text-right">
                  No. Telepon
                </Label>
                <Input id="add-phone" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="col-span-3" placeholder="08xxxxxxxxxx" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-address" className="text-right">
                  Alamat
                </Label>
                <Input id="add-address" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} className="col-span-3" placeholder="Masukkan alamat lengkap" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Data'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto z-[100]">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Edit Data Keluarga</SheetTitle>
            <SheetDescription>Ubah informasi data keluarga di bawah ini.</SheetDescription>
          </SheetHeader>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
              <p className="text-sm text-neutral-500 mt-2">Memuat data...</p>
            </div>
          ) : selectedUser ? (
            <form onSubmit={handleUpdateUser} className="px-6 mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nama Ibu</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>Nama Ayah</Label>
                <Input value={editForm.father_name} onChange={(e) => setEditForm({ ...editForm, father_name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>NIK</Label>
                <Input value={editForm.nik} onChange={(e) => setEditForm({ ...editForm, nik: e.target.value })} maxLength={16} />
              </div>

              <div className="space-y-2">
                <Label>No. KK</Label>
                <Input value={editForm.kk} onChange={(e) => setEditForm({ ...editForm, kk: e.target.value })} maxLength={16} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
              </div>

              <SheetFooter className="mt-8 pb-6 gap-2">
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)} disabled={isSaving}>
                  Batal
                </Button>
              </SheetFooter>
            </form>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-neutral-500">Data tidak ditemukan</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
