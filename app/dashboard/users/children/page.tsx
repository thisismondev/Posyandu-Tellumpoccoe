'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Child = {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  parentName: string;
  parentId: string;
  nik: string;
  birthPlace: string;
  bloodType: string;
  height: number;
  weight: number;
  lastCheckup: string;
  healthStatus: 'healthy' | 'sick' | 'monitoring';
  vaccinationStatus: 'complete' | 'incomplete' | 'pending';
  notes: string;
  registrationDate: string;
};

// Data dummy - ganti dengan fetch dari API
const dummyChildren: Child[] = [
  {
    id: '1',
    name: 'Aisha Zainudin',
    gender: 'female',
    birthDate: '2020-05-15',
    age: 3,
    parentName: 'Ahmad Zainudin',
    parentId: '1',
    nik: '3201234567890001',
    birthPlace: 'Jakarta',
    bloodType: 'A',
    height: 95,
    weight: 14,
    lastCheckup: '2024-01-10',
    healthStatus: 'healthy',
    vaccinationStatus: 'complete',
    notes: 'Perkembangan normal',
    registrationDate: '2026-01-15',
  },
  {
    id: '2',
    name: 'Muhammad Zainudin',
    gender: 'male',
    birthDate: '2018-08-22',
    age: 5,
    parentName: 'Ahmad Zainudin',
    parentId: '1',
    nik: '3201234567890002',
    birthPlace: 'Jakarta',
    bloodType: 'A',
    height: 110,
    weight: 18,
    lastCheckup: '2024-01-10',
    healthStatus: 'healthy',
    vaccinationStatus: 'complete',
    notes: 'Perkembangan sesuai usia',
    registrationDate: '2026-02-10',
  },
  {
    id: '3',
    name: 'Fatimah Nurhaliza',
    gender: 'female',
    birthDate: '2019-03-10',
    age: 4,
    parentName: 'Siti Nurhaliza',
    parentId: '2',
    nik: '3201234567890003',
    birthPlace: 'Jakarta',
    bloodType: 'B',
    height: 102,
    weight: 16,
    lastCheckup: '2024-01-08',
    healthStatus: 'monitoring',
    vaccinationStatus: 'incomplete',
    notes: 'Perlu vaksinasi booster',
    registrationDate: '2025-12-20',
  },
  {
    id: '4',
    name: 'Zahra Nurhaliza',
    gender: 'female',
    birthDate: '2021-11-05',
    age: 2,
    parentName: 'Siti Nurhaliza',
    parentId: '2',
    nik: '3201234567890004',
    birthPlace: 'Jakarta',
    bloodType: 'B',
    height: 88,
    weight: 12,
    lastCheckup: '2024-01-12',
    healthStatus: 'healthy',
    vaccinationStatus: 'complete',
    notes: 'Perkembangan baik',
    registrationDate: '2026-02-15',
  },
  {
    id: '5',
    name: 'Ahmad Santoso',
    gender: 'male',
    birthDate: '2017-06-20',
    age: 6,
    parentName: 'Budi Santoso',
    parentId: '3',
    nik: '3201234567890005',
    birthPlace: 'Jakarta',
    bloodType: 'O',
    height: 115,
    weight: 20,
    lastCheckup: '2023-12-15',
    healthStatus: 'healthy',
    vaccinationStatus: 'complete',
    notes: 'Sehat dan aktif',
    registrationDate: '2025-11-10',
  },
  {
    id: '6',
    name: 'Salsabila Lestari',
    gender: 'female',
    birthDate: '2019-09-12',
    age: 4,
    parentName: 'Dewi Lestari',
    parentId: '4',
    nik: '3201234567890006',
    birthPlace: 'Jakarta',
    bloodType: 'AB',
    height: 100,
    weight: 15,
    lastCheckup: '2024-01-05',
    healthStatus: 'sick',
    vaccinationStatus: 'complete',
    notes: 'Sedang flu, dalam perawatan',
    registrationDate: '2026-01-20',
  },
];

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>(dummyChildren);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Child | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (field: keyof Child) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof Child) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  // Filter data
  const allFilteredChildren = children.filter((child) => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase()) || child.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || child.nik.includes(searchTerm);
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(allFilteredChildren.length / parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const endIndex = startIndex + parseInt(rowsPerPage);

  const filteredChildren = allFilteredChildren
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'registrationDate' || sortField === 'birthDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
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
    if (confirm('Apakah Anda yakin ingin menghapus data anak ini?')) {
      setChildren(children.filter((child) => child.id !== id));
    }
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
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('parentName')}>
                    Orang Tua {getSortIcon('parentName')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('registrationDate')}>
                    Tanggal Daftar {getSortIcon('registrationDate')}
                  </TableHead>
                  <TableHead>Data Kesehatan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChildren.map((child) => {
                    const date = new Date(child.registrationDate);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                    return (
                      <TableRow key={child.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{child.name}</div>
                            <div className="text-xs text-neutral-500">{child.gender === 'male' ? '👦 Laki-laki' : '👧 Perempuan'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{child.age} tahun</div>
                            <div className="text-neutral-500">{child.birthDate}</div>
                            <div className="text-xs text-neutral-400">NIK: {child.nik}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{child.parentName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formattedDate}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>TB: {child.height} cm</div>
                            <div>BB: {child.weight} kg</div>
                            <div>LK: cm</div>
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
              Menampilkan {startIndex + 1}-{Math.min(endIndex, allFilteredChildren.length)} dari {allFilteredChildren.length} data
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
