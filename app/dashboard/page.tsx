import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTable } from '@/components/dashboard/user-table';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Selamat datang di sistem pelaporan kader Innovillage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Kader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">1,234</div>
            <p className="text-xs text-neutral-500 mt-1">+20.1% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Aktif Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">892</div>
            <p className="text-xs text-neutral-500 mt-1">+12.5% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Laporan Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">23</div>
            <p className="text-xs text-neutral-500 mt-1">Menunggu approval</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Wilayah Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">12</div>
            <p className="text-xs text-neutral-500 mt-1">Dari 15 wilayah</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-neutral-900">Data Kader Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
}
