'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  city: string;
  postalCode: string;
  childrenCount: number;
  status: 'active' | 'inactive';
  registeredAt: string;
};

// Data dummy - ganti dengan fetch dari API
const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Ahmad Zainudin',
    email: 'ahmad@example.com',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 123',
    village: 'Kampung Rambutan',
    district: 'Ciracas',
    city: 'Jakarta Timur',
    postalCode: '13830',
    childrenCount: 2,
    status: 'active',
    registeredAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '081234567891',
    address: 'Jl. Sudirman No. 45',
    village: 'Kebayoran Baru',
    district: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    childrenCount: 3,
    status: 'active',
    registeredAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567892',
    address: 'Jl. Gatot Subroto No. 78',
    village: 'Menteng',
    district: 'Menteng',
    city: 'Jakarta Pusat',
    postalCode: '10310',
    childrenCount: 1,
    status: 'inactive',
    registeredAt: '2023-12-20',
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    phone: '081234567893',
    address: 'Jl. Thamrin No. 22',
    village: 'Tanah Abang',
    district: 'Tanah Abang',
    city: 'Jakarta Pusat',
    postalCode: '10230',
    childrenCount: 4,
    status: 'active',
    registeredAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    email: 'eko@example.com',
    phone: '081234567894',
    address: 'Jl. Rasuna Said No. 56',
    village: 'Setiabudi',
    district: 'Setiabudi',
    city: 'Jakarta Selatan',
    postalCode: '12950',
    childrenCount: 2,
    status: 'active',
    registeredAt: '2024-01-12',
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(dummyUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof User) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  // Filter and sort data
  const allFilteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(allFilteredUsers.length / parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const endIndex = startIndex + parseInt(rowsPerPage);

  // Apply sorting and pagination
  const filteredUsers = allFilteredUsers
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    })
    .slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when search or rows per page changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data keluarga ini?')) {
      setUsers(users.filter((user) => user.id !== id));
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
            {/* <Link href="">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Keluarga
              </Button>
            </Link> */}
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
          </div>

          {/* Table */}
          <div className="rounded-md border border-neutral-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('name')}>
                    Nama Keluarga {getSortIcon('name')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('email')}>
                    Kontak {getSortIcon('email')}
                  </TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50 text-center" onClick={() => handleSort('childrenCount')}>
                    Jumlah Anak {getSortIcon('childrenCount')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('registeredAt')}>
                    Tanggal Daftar {getSortIcon('registeredAt')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('status')}>
                    Status {getSortIcon('status')}
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const date = new Date(user.registeredAt);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-neutral-500">73020222090293</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{user.email}</div>
                            <div className="text-neutral-500">{user.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-[200px]">{user.address}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {user.childrenCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formattedDate}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>{user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(user.id)}>
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
              Menampilkan {startIndex + 1}-{Math.min(endIndex, allFilteredUsers.length)} dari {allFilteredUsers.length} data
            </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
