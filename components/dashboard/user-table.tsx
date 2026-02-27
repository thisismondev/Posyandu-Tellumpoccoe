'use client';

import { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  village: string;
  city: string;
  registeredAt: string;
};

// Data dummy - ganti dengan fetch dari API Anda
const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Ahmad Zainudin',
    email: 'ahmad@example.com',
    phone: '081234567890',
    address: 'Jl. Merdeka No. 123',
    village: 'Kampung Rambutan',
    city: 'Jakarta Timur',
    registeredAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    phone: '081234567891',
    address: 'Jl. Sudirman No. 45',
    village: 'Kebayoran Baru',
    city: 'Jakarta Selatan',
    registeredAt: '2024-01-14',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567892',
    address: 'Jl. Gatot Subroto No. 78',
    village: 'Menteng',
    city: 'Jakarta Pusat',
    registeredAt: '2023-12-20',
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    phone: '081234567893',
    address: 'Jl. Thamrin No. 22',
    village: 'Tanah Abang',
    city: 'Jakarta Pusat',
    registeredAt: '2024-01-10',
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    email: 'eko@example.com',
    phone: '081234567894',
    address: 'Jl. Rasuna Said No. 56',
    village: 'Setiabudi',
    city: 'Jakarta Selatan',
    registeredAt: '2024-01-12',
  },
];

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  // Generate years array for filter (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Filter data
  const filteredUsers = dummyUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.village.toLowerCase().includes(searchTerm.toLowerCase());

    // Month and year filter
    const registeredDate = new Date(user.registeredAt);
    const matchesMonth = monthFilter === 'all' || registeredDate.getMonth() === parseInt(monthFilter);
    const matchesYear = yearFilter === 'all' || registeredDate.getFullYear() === parseInt(yearFilter);

    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Input placeholder="Cari nama, email, atau kampung..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[150px]">
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
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
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
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border border-neutral-200">
        <Table>
          <TableCaption>Daftar keluarga terbaru terdaftar</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Keluarga</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Alamat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.slice(0, 5).map((user) => {
                const date = new Date(user.registeredAt);
                const formattedDate = `${date.getDate()} ${date.toLocaleString('id-ID', { month: 'short' })} ${date.getFullYear()}`;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-neutral-500">NIK: 73020222090293</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.email}</div>
                        <div className="text-neutral-500">{user.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formattedDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-[250px]">
                        <div>{user.address}</div>
                        <div className="text-neutral-500">
                          {user.village}, {user.city}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
