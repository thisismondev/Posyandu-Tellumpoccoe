'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type User = {
  id_users: string;
  name: string;
  father_name: string | null;
  nik: string | null;
  kk: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  children_count: number;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
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
    if (confirm('Apakah Anda yakin ingin menghapus data keluarga ini?')) {
      // TODO: Implement delete API call
      alert('Delete functionality belum diimplementasikan');
    }
  };

  return (
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
            {/* <Link href="">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Keluarga
              </Button>
            </Link> */}
            <Button className="gap-2">
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
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
                          <div className="text-sm max-w-[200px]">{capitalizeName(user.address) || '-'}</div>
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
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
  );
}
