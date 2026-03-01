'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { Measurement } from '@/types/measure';

// Type untuk dropdown anak
type ChildOption = {
  id: string; // atau number tergantung DB
  name: string;
  nik: string;
};

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('measured_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State untuk filter bulan dan tahun
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [filterKey, setFilterKey] = useState(0); // Key untuk force re-render Select

  // State untuk Add Dialog (AlertDialog)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    children_id: '',
    measured_at: new Date().toISOString().split('T')[0], // Default hari ini
    heightCm: '',
    weightKg: '',
    headCm: '',
    armCm: '',
  });

  // State untuk Edit Sheet
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState<Measurement | null>(null);
  const [editForm, setEditForm] = useState({
    measured_at: '',
    heightCm: '',
    weightKg: '',
    headCm: '',
    armCm: '',
  });

  // State untuk dropdown anak
  const [childrenList, setChildrenList] = useState<ChildOption[]>([]);

  // Data bulan
  const months = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  // Generate tahun (5 tahun terakhir sampai tahun ini)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => (currentYear - i).toString());

  // Helper function untuk capitalize nama
  const capitalizeName = (name: string | null): string => {
    if (!name) return '-';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch measurements dari API
  useEffect(() => {
    fetchMeasurements();
  }, [currentPage, rowsPerPage, searchTerm, sortField, sortDirection, selectedMonth, selectedYear]);

  // Fetch children list untuk dropdown
  useEffect(() => {
    fetchChildrenList();
  }, []);

  const fetchChildrenList = async () => {
    try {
      const response = await fetch('/api/children/list');
      const result = await response.json();
      if (result.success) {
        setChildrenList(result.data);
      }
    } catch (err) {
      console.error('Error fetching children list:', err);
    }
  };

  const fetchMeasurements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: rowsPerPage,
        search: searchTerm,
        sortBy: sortField,
        sortOrder: sortDirection,
        ...(selectedMonth && { month: selectedMonth }),
        ...(selectedYear && { year: selectedYear }),
      });

      const response = await fetch(`/api/measure?${params}`);
      const result = await response.json();

      if (result.success) {
        setMeasurements(result.data);
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
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  // Handler untuk reset filter
  const handleResetFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setSearchTerm('');
    setCurrentPage(1);
    setFilterKey((prev) => prev + 1); // Increment key untuk force re-render Select
  };

  // Handler untuk Add Measurement
  const handleAddMeasure = async () => {
    if (!addForm.children_id || !addForm.measured_at) {
      alert('Nama Anak dan Tanggal Pengukuran wajib diisi');
      return;
    }

    try {
      setIsAddLoading(true);

      const response = await fetch('/api/measure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          children_id: addForm.children_id,
          measured_at: addForm.measured_at,
          heightCm: addForm.heightCm ? parseFloat(addForm.heightCm) : 0,
          weightKg: addForm.weightKg ? parseFloat(addForm.weightKg) : 0,
          headCm: addForm.headCm ? parseFloat(addForm.headCm) : 0,
          armCm: addForm.armCm ? parseFloat(addForm.armCm) : 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Data pengukuran berhasil ditambahkan');
        setIsAddDialogOpen(false);
        setAddForm({
          children_id: '',
          measured_at: new Date().toISOString().split('T')[0],
          heightCm: '',
          weightKg: '',
          headCm: '',
          armCm: '',
        });
        fetchMeasurements();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding measurement:', error);
      alert('Terjadi kesalahan saat menambahkan data');
    } finally {
      setIsAddLoading(false);
    }
  };

  // Handler untuk Edit (buka Sheet)
  const handleEdit = async (measurement: Measurement) => {
    setSelectedMeasure(measurement);
    setEditForm({
      measured_at: measurement.measured_at,
      heightCm: measurement.heightCm?.toString() || '',
      weightKg: measurement.weightKg?.toString() || '',
      headCm: measurement.headCm?.toString() || '',
      armCm: measurement.armCm?.toString() || '',
    });
    setIsEditSheetOpen(true);
  };

  // Handler untuk Update Measurement
  const handleUpdateMeasure = async () => {
    if (!selectedMeasure) return;

    try {
      setIsEditLoading(true);

      const response = await fetch(`/api/measure/${selectedMeasure.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measured_at: editForm.measured_at,
          heightCm: editForm.heightCm ? parseFloat(editForm.heightCm) : 0,
          weightKg: editForm.weightKg ? parseFloat(editForm.weightKg) : 0,
          headCm: editForm.headCm ? parseFloat(editForm.headCm) : 0,
          armCm: editForm.armCm ? parseFloat(editForm.armCm) : 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Data pengukuran berhasil diperbarui');
        setIsEditSheetOpen(false);
        setSelectedMeasure(null);
        fetchMeasurements();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating measurement:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Handler untuk Delete
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pengukuran ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/measure/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Data pengukuran berhasil dihapus');
        fetchMeasurements();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">History Pengukuran</h1>
          <p className="text-neutral-600 mt-1">Riwayat pengukuran kesehatan anak</p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-neutral-900">Daftar Pengukuran</CardTitle>
          <CardDescription>Kelola dan monitor riwayat pengukuran kesehatan anak</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Input placeholder="Cari nama anak..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />

                <Select
                  key={`month-${filterKey}`}
                  value={selectedMonth || undefined}
                  onValueChange={(value) => {
                    setSelectedMonth(value);
                    // Jika memilih bulan tapi belum ada tahun, set tahun ke tahun sekarang
                    if (value && !selectedYear) {
                      setSelectedYear(currentYear.toString());
                    }
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  key={`year-${filterKey}`}
                  value={selectedYear || undefined}
                  onValueChange={(value) => {
                    setSelectedYear(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Semua Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(selectedMonth || selectedYear || searchTerm) && (
                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Reset Filter
                  </Button>
                )}

                <Select value={rowsPerPage} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="w-[130px]">
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
                Tambah Pengukuran
              </Button>
            </div>

            {/* Active Filters Display */}
            {(selectedMonth || selectedYear) && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <span>Filter aktif:</span>
                {selectedMonth && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">{months.find((m) => m.value === selectedMonth)?.label}</span>}
                {selectedYear && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">{selectedYear}</span>}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 w-[150px]" onClick={() => handleSort('measured_at')}>
                    Tanggal Pengukuran {getSortIcon('measured_at')}
                  </TableHead>
                  <TableHead className="w-[200px]">Nama Anak</TableHead>
                  <TableHead className="w-[120px] text-center">Usia (Bulan)</TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 w-[100px] text-center" onClick={() => handleSort('heightCm')}>
                    TB (cm) {getSortIcon('heightCm')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 w-[100px] text-center" onClick={() => handleSort('weightKg')}>
                    BB (kg) {getSortIcon('weightKg')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 w-[100px] text-center" onClick={() => handleSort('headCm')}>
                    LK (cm) {getSortIcon('headCm')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 w-[100px] text-center" onClick={() => handleSort('armCm')}>
                    LILA (cm) {getSortIcon('armCm')}
                  </TableHead>
                  <TableHead className="text-center w-[120px] ">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-500" />
                      <p className="text-sm text-neutral-500 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-500">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : measurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  measurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell className="w-[150px]">
                        <div className="text-sm font-medium">{formatDate(measurement.measured_at)}</div>
                      </TableCell>
                      <TableCell className="max-w-[250px] line-clamp-2 truncate">
                        <div className="text-sm font-medium">{capitalizeName(measurement.child_name)}</div>
                      </TableCell>
                      <TableCell className="w-[120px] text-center">
                        <div className="text-sm font-semibold">{measurement.age_months}</div>
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        <div className="text-sm">{measurement.heightCm ? measurement.heightCm.toFixed(1) : '-'}</div>
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        <div className="text-sm">{measurement.weightKg ? measurement.weightKg.toFixed(1) : '-'}</div>
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        <div className="text-sm">{measurement.headCm ? measurement.headCm.toFixed(1) : '-'}</div>
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        <div className="text-sm">{measurement.armCm ? measurement.armCm.toFixed(1) : '-'}</div>
                      </TableCell>
                      <TableCell className="text-right w-[120px]">
                        <div className="flex items-center justify-end gap-1">
                          {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button> */}
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit" onClick={() => handleEdit(measurement)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(measurement.id)} title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Menampilkan {measurements.length > 0 ? (currentPage - 1) * parseInt(rowsPerPage) + 1 : 0}-{Math.min(currentPage * parseInt(rowsPerPage), total)} dari {total} data
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(page)} className="h-8 w-8 p-0">
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

                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AlertDialog untuk Tambah Pengukuran */}
      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Tambah Data Pengukuran</AlertDialogTitle>
            <AlertDialogDescription>Masukkan data pengukuran anak baru</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="children_id">Nama Anak *</Label>
              <Select value={addForm.children_id} onValueChange={(value) => setAddForm({ ...addForm, children_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih anak" />
                </SelectTrigger>
                <SelectContent>
                  {childrenList.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {capitalizeName(child.name)} - {child.nik}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="measured_at">Tanggal Pengukuran *</Label>
              <Input id="measured_at" type="date" value={addForm.measured_at} onChange={(e) => setAddForm({ ...addForm, measured_at: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="heightCm">Tinggi Badan (cm)</Label>
                <Input id="heightCm" type="number" step="0.1" placeholder="0.0" value={addForm.heightCm} onChange={(e) => setAddForm({ ...addForm, heightCm: e.target.value })} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weightKg">Berat Badan (kg)</Label>
                <Input id="weightKg" type="number" step="0.1" placeholder="0.0" value={addForm.weightKg} onChange={(e) => setAddForm({ ...addForm, weightKg: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="headCm">Lingkar Kepala (cm)</Label>
                <Input id="headCm" type="number" step="0.1" placeholder="0.0" value={addForm.headCm} onChange={(e) => setAddForm({ ...addForm, headCm: e.target.value })} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="armCm">LILA (cm)</Label>
                <Input id="armCm" type="number" step="0.1" placeholder="0.0" value={addForm.armCm} onChange={(e) => setAddForm({ ...addForm, armCm: e.target.value })} />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAddLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddMeasure} disabled={isAddLoading}>
              {isAddLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sheet untuk Edit Pengukuran */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Data Pengukuran</SheetTitle>
            <SheetDescription>Perbarui data pengukuran anak</SheetDescription>
          </SheetHeader>

          {selectedMeasure && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nama Anak</Label>
                <Input value={capitalizeName(selectedMeasure.child_name)} disabled className="bg-neutral-50" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_measured_at">Tanggal Pengukuran *</Label>
                <Input id="edit_measured_at" type="date" value={editForm.measured_at} onChange={(e) => setEditForm({ ...editForm, measured_at: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_heightCm">Tinggi Badan (cm)</Label>
                  <Input id="edit_heightCm" type="number" step="0.1" placeholder="0.0" value={editForm.heightCm} onChange={(e) => setEditForm({ ...editForm, heightCm: e.target.value })} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_weightKg">Berat Badan (kg)</Label>
                  <Input id="edit_weightKg" type="number" step="0.1" placeholder="0.0" value={editForm.weightKg} onChange={(e) => setEditForm({ ...editForm, weightKg: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_headCm">Lingkar Kepala (cm)</Label>
                  <Input id="edit_headCm" type="number" step="0.1" placeholder="0.0" value={editForm.headCm} onChange={(e) => setEditForm({ ...editForm, headCm: e.target.value })} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_armCm">LILA (cm)</Label>
                  <Input id="edit_armCm" type="number" step="0.1" placeholder="0.0" value={editForm.armCm} onChange={(e) => setEditForm({ ...editForm, armCm: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <SheetFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)} disabled={isEditLoading}>
              Batal
            </Button>
            <Button onClick={handleUpdateMeasure} disabled={isEditLoading}>
              {isEditLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
