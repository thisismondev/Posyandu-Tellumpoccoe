'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Child } from '@/types/child';

export default function ChildrenPage() {
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

  // Helper function untuk capitalize nama
  const capitalizeName = (name: string | null): string => {
    if (!name) return '-';
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch children dari API
  useEffect(() => {
    fetchChildren();
  }, [currentPage, rowsPerPage, searchTerm, sortField, sortDirection]);

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
    if (confirm('Apakah Anda yakin ingin menghapus data anak ini?')) {
      // TODO: Implement delete functionality
      console.log('Delete child:', id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;
  };

  const formatAge = (years: number, months: number) => {
    if (years === 0 && months === 0) return '-';
    return `${years} tahun`;
  };

  // Format gender untuk display
  const formatGender = (gender: 'male' | 'female') => {
    return gender === 'male' ? '👦 Laki-laki' : '👧 Perempuan';
  };

  return (
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
          <CardTitle className="text-neutral-900">Daftar Anak</CardTitle>
          <CardDescription>Kelola dan monitor data kesehatan anak terdaftar</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Input placeholder="Cari nama anak, orang tua, NIK..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />
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
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('age')}>
                    Data Diri {getSortIcon('age')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('parent_name')}>
                    Orang Tua {getSortIcon('parent_name')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('created_at')}>
                    Tanggal Daftar {getSortIcon('created_at')}
                  </TableHead>
                  <TableHead>Data Kesehatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-500" />
                      <p className="text-sm text-neutral-500 mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-red-500">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : children.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  children.map((child) => {
                    const date = new Date(child.created_at);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                    return (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{capitalizeName(child.name)}</div>
                            <div className="text-xs text-neutral-500">{formatGender(child.gender)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{child.age} tahun</div>
                            <div className="text-neutral-500">{child.birth ? formatDate(child.birth) : '-'}</div>
                            <div className="text-xs text-neutral-400">NIK: {child.nik || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{capitalizeName(child.parent_name)}</div>
                          <div className="text-sm">{capitalizeName(child.father_name)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formattedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>TB: {child.heightCm ? `${child.heightCm} cm` : '-'}</div>
                            <div>BB: {child.weightKg ? `${child.weightKg} kg` : '-'}</div>
                            <div>LK: {child.headCm ? `${child.headCm} cm` : '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(child.id)}>
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
              Menampilkan {children.length > 0 ? (currentPage - 1) * parseInt(rowsPerPage) + 1 : 0}-{Math.min(currentPage * parseInt(rowsPerPage), total)} dari {total} data
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
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
