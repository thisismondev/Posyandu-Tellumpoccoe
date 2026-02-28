'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Measurement } from '@/types/measure';

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
  }, [currentPage, rowsPerPage, searchTerm, sortField, sortDirection]);

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

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengukuran ini?')) {
      // TODO: Implement delete functionality
      console.log('Delete measurement:', id);
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
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Input placeholder="Cari nama anak..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />
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
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Pengukuran
            </Button>
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
                  <TableHead className="text-right w-[120px]">Aksi</TableHead>
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
                      <TableCell className="w-[200px]">
                        <div className="text-sm font-medium">{capitalizeName(measurement.child_name)}</div>
                      </TableCell>
                      <TableCell className="w-[120px] text-center">
                        <div className="text-sm font-semibold">{measurement.age_months} bulan</div>
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
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
    </div>
  );
}
