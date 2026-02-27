'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

type Measurement = {
  id: string;
  childId: string;
  childName: string;
  age: number;
  date: string;
  height: number;
  weight: number;
  headCircumference: number;
  armCircumference: number;
  status: 'normal' | 'underweight' | 'overweight' | 'stunting';
  notes: string;
  measuredBy: string;
};

// Data dummy
const dummyMeasurements: Measurement[] = [
  {
    id: '1',
    childId: '1',
    childName: 'Aisha Zainudin',
    age: 36,
    date: '2026-01-15',
    height: 95,
    weight: 14,
    headCircumference: 48,
    armCircumference: 16,
    status: 'normal',
    notes: 'Perkembangan normal, sehat',
    measuredBy: 'Bidan Ani',
  },
  {
    id: '2',
    childId: '1',
    childName: 'Aisha Zainudin',
    age: 30,
    date: '2025-08-10',
    height: 92,
    weight: 13,
    headCircumference: 47,
    armCircumference: 15.5,
    status: 'normal',
    notes: 'Pertumbuhan baik',
    measuredBy: 'Bidan Ani',
  },
  {
    id: '3',
    childId: '2',
    childName: 'Muhammad Zainudin',
    age: 60,
    date: '2026-02-15',
    height: 110,
    weight: 18,
    headCircumference: 50,
    armCircumference: 17,
    status: 'normal',
    notes: 'Sehat dan aktif',
    measuredBy: 'Bidan Ani',
  },
  {
    id: '4',
    childId: '3',
    childName: 'Fatimah Nurhaliza',
    age: 48,
    date: '2026-01-08',
    height: 102,
    weight: 16,
    headCircumference: 49,
    armCircumference: 16.5,
    status: 'normal',
    notes: 'Perkembangan sesuai usia',
    measuredBy: 'Bidan Siti',
  },
  {
    id: '5',
    childId: '6',
    childName: 'Salsabila Lestari',
    age: 48,
    date: '2025-12-05',
    height: 100,
    weight: 15,
    headCircumference: 48,
    armCircumference: 16,
    status: 'underweight',
    notes: 'Perlu perhatian khusus, BB kurang',
    measuredBy: 'Bidan Dewi',
  },
  {
    id: '6',
    childId: '4',
    childName: 'Zahra Nurhaliza',
    age: 24,
    date: '2026-02-12',
    height: 88,
    weight: 12,
    headCircumference: 47,
    armCircumference: 15,
    status: 'normal',
    notes: 'Perkembangan baik',
    measuredBy: 'Bidan Siti',
  },
  {
    id: '7',
    childId: '5',
    childName: 'Ahmad Santoso',
    age: 72,
    date: '2025-06-20',
    height: 115,
    weight: 20,
    headCircumference: 50,
    armCircumference: 17.5,
    status: 'overweight',
    notes: 'BB sedikit lebih, perlu diet seimbang',
    measuredBy: 'Bidan Ani',
  },
  {
    id: '8',
    childId: '3',
    childName: 'Fatimah Nurhaliza',
    age: 42,
    date: '2025-07-12',
    height: 98,
    weight: 14,
    headCircumference: 48,
    armCircumference: 15.5,
    status: 'stunting',
    notes: 'Tinggi kurang dari standar, perlu monitoring',
    measuredBy: 'Bidan Siti',
  },
];

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>(dummyMeasurements);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Measurement | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Generate years from 2025 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2024 }, (_, i) => 2025 + i);

  // Handle sorting
  const handleSort = (field: keyof Measurement) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof Measurement) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline" /> : <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  // Filter data
  const allFilteredMeasurements = measurements.filter((measurement) => {
    const matchesSearch = measurement.childName.toLowerCase().includes(searchTerm.toLowerCase()) || measurement.measuredBy.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const measurementMonth = new Date(measurement.date).getMonth();
      matchesMonth = measurementMonth === parseInt(monthFilter);
    }

    let matchesYear = true;
    if (yearFilter !== 'all') {
      const measurementYear = new Date(measurement.date).getFullYear();
      matchesYear = measurementYear === parseInt(yearFilter);
    }

    return matchesSearch && matchesMonth && matchesYear;
  });

  // Pagination
  const totalPages = Math.ceil(allFilteredMeasurements.length / parseInt(rowsPerPage));
  const startIndex = (currentPage - 1) * parseInt(rowsPerPage);
  const endIndex = startIndex + parseInt(rowsPerPage);

  const filteredMeasurements = allFilteredMeasurements
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle date sorting
      if (sortField === 'date') {
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

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleMonthChange = (value: string) => {
    setMonthFilter(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value: string) => {
    setYearFilter(value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data pengukuran ini?')) {
      setMeasurements(measurements.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">History Pengukuran</h1>
          <p className="text-neutral-600 mt-1">Riwayat pengukuran dan pertumbuhan anak</p>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-neutral-900">Riwayat Pengukuran</CardTitle>
          <CardDescription>Data lengkap pengukuran tinggi, berat, dan lingkar kepala anak</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Input placeholder="Cari nama anak atau petugas..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm" />
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
              <Select value={monthFilter} onValueChange={handleMonthChange}>
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  <SelectItem value="0">Januari</SelectItem>
                  <SelectItem value="1">Februari</SelectItem>
                  <SelectItem value="2">Maret</SelectItem>
                  <SelectItem value="3">April</SelectItem>
                  <SelectItem value="4">Mei</SelectItem>
                  <SelectItem value="5">Juni</SelectItem>
                  <SelectItem value="6">Juli</SelectItem>
                  <SelectItem value="7">Agustus</SelectItem>
                  <SelectItem value="8">September</SelectItem>
                  <SelectItem value="9">Oktober</SelectItem>
                  <SelectItem value="10">November</SelectItem>
                  <SelectItem value="11">Desember</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={handleYearChange}>
                <SelectTrigger className="max-w-[180px]">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahun</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
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
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('date')}>
                    Tanggal {getSortIcon('date')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('childName')}>
                    Nama Anak {getSortIcon('childName')}
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-neutral-50" onClick={() => handleSort('age')}>
                    Usia {getSortIcon('age')}
                  </TableHead>
                  <TableHead>TB (cm)</TableHead>
                  <TableHead>BB (kg)</TableHead>
                  <TableHead>LK (cm)</TableHead>
                  <TableHead>LiLA (cm)</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeasurements.map((measurement) => {
                    const date = new Date(measurement.date);
                    const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                    return (
                      <TableRow key={measurement.id}>
                        <TableCell className="font-medium">{formattedDate}</TableCell>
                        <TableCell>{measurement.childName}</TableCell>
                        <TableCell>{measurement.age} bulan</TableCell>
                        <TableCell>{measurement.height}</TableCell>
                        <TableCell>{measurement.weight}</TableCell>
                        <TableCell>{measurement.headCircumference}</TableCell>
                        <TableCell>{measurement.armCircumference}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(measurement.id)}>
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
              Menampilkan {startIndex + 1}-{Math.min(endIndex, allFilteredMeasurements.length)} dari {allFilteredMeasurements.length} data
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
