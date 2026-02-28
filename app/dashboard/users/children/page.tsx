'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2, CalendarIcon } from 'lucide-react';
import { Child } from '@/types/child';

// Tipe data sederhana untuk dropdown orang tua
type ParentOption = {
  id_users: string;
  name: string;
  email: string;
};

export default function ChildrenPage() {
  // --- EXISTING STATE ---
  const [children, setChildren] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // --- NEW STATE FOR CRUD ---
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // State untuk dropdown orang tua
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  // Form State - Add
  const [addForm, setAddForm] = useState({
    users_id: '',
    name: '',
    nik: '',
    gender: '',
    birth: '',
    birth_place: '',
    height: '',
    weight: '',
    head: '',
    child_no: '1',
  });

  // Form State - Edit
  const [editForm, setEditForm] = useState({
    name: '',
    nik: '',
    gender: '',
    birth: '',
    height: '',
    weight: '',
    head: '',
    child_no: '',
  });

  // Helper capitalization
  const capitalizeName = (name: string | null): string => {
    if (!name) return '-';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // --- EFFECTS ---

  useEffect(() => {
    fetchChildren();
  }, [currentPage, rowsPerPage, searchTerm, sortField, sortDirection]);

  // Fetch parents saat dialog add dibuka
  useEffect(() => {
    if (isAddDialogOpen && parents.length === 0) {
      fetchParents();
    }
  }, [isAddDialogOpen]);

  // --- API FUNCTIONS ---

  const fetchParents = async () => {
    setIsLoadingParents(true);
    try {
      // Kita perlu custom endpoint atau select dari users table
      // Untuk simplifikasi, kita asumsikan ada endpoint ini atau gunakan endpoint users existing
      const response = await fetch('/api/users?limit=100'); // Ambil 100 user pertama
      const result = await response.json();
      if (result.success) {
        setParents(result.data);
      }
    } catch (err) {
      console.error('Error fetching parents:', err);
    } finally {
      setIsLoadingParents(false);
    }
  };

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage,
        search: searchTerm,
        sortBy: sortField,
        sortOrder: sortDirection,
      });

      const response = await fetch(`/api/children?${params}`);
      const result = await response.json();

      if (result.success) {
        setChildren(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...addForm,
        height: parseFloat(addForm.height) || 0,
        weight: parseFloat(addForm.weight) || 0,
        head: parseFloat(addForm.head) || 0,
        child_no: parseInt(addForm.child_no) || 1,
      };

      const response = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Gagal menambah data');

      alert('Data anak berhasil ditambahkan');
      setIsAddDialogOpen(false);
      setAddForm({
        // Reset form
        users_id: '',
        name: '',
        nik: '',
        gender: '',
        birth: '',
        birth_place: '',
        height: '',
        weight: '',
        head: '',
        child_no: '1',
      });
      fetchChildren();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (child: any) => {
    // Gunakan any atau type Child yang lengkap

    setSelectedChild(child);
    const validGender = child.gender === 'L' || child.gender === 'P' ? child.gender : 'L';
    setEditForm({
      name: child.name,
      nik: child.nik || '',
      gender: validGender,
      birth: child.birth ? new Date(child.birth).toISOString().split('T')[0] : '',
      height: child.heightCm?.toString() || '',
      weight: child.weightKg?.toString() || '',
      head: child.headCm?.toString() || '',
      child_no: child.child_no?.toString() || '1',
    });
    setIsEditSheetOpen(true);
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    setIsSaving(true);

    try {
      const payload = {
        ...editForm,
        height: parseFloat(editForm.height) || 0,
        weight: parseFloat(editForm.weight) || 0,
        head: parseFloat(editForm.head) || 0,
        child_no: parseInt(editForm.child_no) || 1,
      };

      const response = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Gagal update data');

      alert('Data anak berhasil diperbarui');
      setIsEditSheetOpen(false);
      fetchChildren();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data anak ini secara permanen?')) return;

    // Optimistic UI update (optional)
    setIsLoading(true);

    try {
      const response = await fetch(`/api/children/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal menghapus');

      alert('Data anak berhasil dihapus');
      fetchChildren();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus data');
      setIsLoading(false);
    }
  };

  // --- HANDLERS LAINNYA ---
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
  };
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;
  };
  const formatGender = (gender: string) => {
    if (!gender) return '👦 Laki-laki';
    const g = gender.toUpperCase();
    // Support berbagai format: 'P', 'PEREMPUAN', 'FEMALE'
    if (g === 'P' || g === 'PEREMPUAN' || g === 'FEMALE') {
      return '👧 Perempuan';
    }
    return '👦 Laki-laki';
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Manajemen Anak</h1>
            <p className="text-neutral-600 mt-1">Kelola data anak dan pemantauan kesehatan</p>
          </div>
        </div>

        {/* Table Card */}
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-neutral-900">Daftar Anak</CardTitle>
                <CardDescription>Kelola dan monitor data kesehatan anak terdaftar</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <Input placeholder="Cari nama, orang tua, NIK..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />
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
                Tambah Data Anak
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-neutral-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('name')}>
                      Nama Anak {getSortIcon('name')}
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('birth')}>
                      Data Diri {getSortIcon('birth')}
                    </TableHead>
                    <TableHead>Orang Tua</TableHead>
                    <TableHead>Data Kesehatan (Awal)</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-500" />
                        <p className="text-sm text-neutral-500 mt-2">Memuat data...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-red-500">
                        Error: {error}
                      </TableCell>
                    </TableRow>
                  ) : children.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                        Tidak ada data ditemukan
                      </TableCell>
                    </TableRow>
                  ) : (
                    children.map(
                      (
                        child: any, // Adjust type logic
                      ) => (
                        <TableRow key={child.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{capitalizeName(child.name)}</div>
                              <div className="text-xs text-neutral-500">{formatGender(child.gender)}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-neutral-500">{child.birth ? formatDate(child.birth) : '-'}</div>
                              <div className="text-xs text-neutral-400">NIK: {child.nik || '-'}</div>
                              <div className="text-xs text-neutral-400">Anak ke-{child.child_no}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{child.parent_name ? capitalizeName(child.parent_name) : '-'}</div>
                            <div className="text-xs text-neutral-500">{child.father_name ? capitalizeName(child.father_name) : '-'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-neutral-600">
                              <div>TB: {child.heightCm || '-'} cm</div>
                              <div>BB: {child.weightKg || '-'} kg</div>
                              <div>LK: {child.headCm || '-'} cm</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(child)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(child.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ),
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination (Simplified) */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-neutral-600">Total {total} Data</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Prev
                </Button>
                <div className="text-sm">
                  Page {currentPage} of {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- DIALOG TAMBAH ANAK --- */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Data Anak</DialogTitle>
            <DialogDescription>Masukkan data anak baru. Pastikan memilih orang tua yang benar.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddChild}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Orang Tua <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Select value={addForm.users_id} onValueChange={(val) => setAddForm({ ...addForm, users_id: val })} required>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingParents ? 'Memuat...' : 'Pilih Orang Tua'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {parents.map((p) => (
                        <SelectItem key={p.id_users} value={p.id_users}>
                          {p.name} ({p.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nama Anak <span className="text-red-500">*</span>
                </Label>
                <Input id="name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="col-span-3" required />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nik" className="text-right">
                  NIK <span className="text-red-500">*</span>
                </Label>
                <Input id="nik" value={addForm.nik} onChange={(e) => setAddForm({ ...addForm, nik: e.target.value })} className="col-span-3" required maxLength={16} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Select value={addForm.gender} onValueChange={(val) => setAddForm({ ...addForm, gender: val })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Jenis Kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birth" className="text-right">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </Label>
                <Input type="date" id="birth" value={addForm.birth} onChange={(e) => setAddForm({ ...addForm, birth: e.target.value })} className="col-span-3" required />
              </div>

              {/* Data Fisik Awal */}
              <div className="grid grid-cols-4 gap-4 border-t pt-4 mt-2">
                <Label className="col-span-4 font-semibold">Data Lahir/Awal</Label>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="height" className="text-right">
                  TB (cm)
                </Label>
                <Input type="number" step="0.1" id="height" value={addForm.height} onChange={(e) => setAddForm({ ...addForm, height: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  BB (kg)
                </Label>
                <Input type="number" step="0.1" id="weight" value={addForm.weight} onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">
                  LK (cm)
                </Label>
                <Input type="number" step="0.1" id="weight" value={addForm.head} onChange={(e) => setAddForm({ ...addForm, head: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="no" className="text-right">
                  Anak Ke-
                </Label>
                <Input type="number" id="no" value={addForm.child_no} onChange={(e) => setAddForm({ ...addForm, child_no: e.target.value })} className="col-span-3" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Data'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- SHEET EDIT ANAK --- */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto z-[100]">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Edit Data Anak</SheetTitle>
            <SheetDescription>Perbarui informasi data anak.</SheetDescription>
          </SheetHeader>

          <form onSubmit={handleUpdateChild} className="px-6 mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nama Anak</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label>NIK</Label>
              <Input value={editForm.nik} onChange={(e) => setEditForm({ ...editForm, nik: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label className="text-right">
                Jenis Kelamin <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3">
                <Select value={editForm.gender} onValueChange={(val) => setEditForm({ ...editForm, gender: val })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[200]">
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input type="date" value={editForm.birth} onChange={(e) => setEditForm({ ...editForm, birth: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tinggi (cm)</Label>
                <Input type="number" step="0.1" value={editForm.height} onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Berat (kg)</Label>
                <Input type="number" step="0.1" value={editForm.weight} onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anak Ke-</Label>
              <Input type="number" value={editForm.child_no} onChange={(e) => setEditForm({ ...editForm, child_no: e.target.value })} />
            </div>

            <SheetFooter className="mt-8 gap-2">
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditSheetOpen(false)} disabled={isSaving}>
                Batal
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
