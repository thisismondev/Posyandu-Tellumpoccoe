'use client';

import { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  region: string;
  lastReport: string;
  status: 'active' | 'inactive' | 'pending';
};

// Data dummy - ganti dengan fetch dari API Anda
const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Ahmad Zainudin',
    email: 'ahmad@example.com',
    role: 'Kader',
    region: 'Jakarta Pusat',
    lastReport: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    email: 'siti@example.com',
    role: 'Koordinator',
    region: 'Jakarta Selatan',
    lastReport: '2024-01-14',
    status: 'active',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    role: 'Kader',
    region: 'Jakarta Timur',
    lastReport: '2023-12-20',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    email: 'dewi@example.com',
    role: 'Kader',
    region: 'Jakarta Barat',
    lastReport: '2024-01-10',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    email: 'eko@example.com',
    role: 'Koordinator',
    region: 'Jakarta Utara',
    lastReport: '2024-01-12',
    status: 'active',
  },
];

export function UserTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter data
  const filteredUsers = dummyUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border border-neutral-200">
        <Table>
          <TableCaption>Daftar kader dan status laporan mereka</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead>Laporan Terakhir</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.region}</TableCell>
                <TableCell>{user.lastReport}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : user.status === 'inactive' ? 'destructive' : 'secondary'}>{user.status === 'active' ? 'Aktif' : user.status === 'inactive' ? 'Tidak Aktif' : 'Pending'}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
