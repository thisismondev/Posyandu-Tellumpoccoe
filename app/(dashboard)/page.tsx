import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Baby, TrendingUp, Calendar, UserPlus, Activity, Heart, MapPin, AlertCircle } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function getDashboardStats() {
  try {
    // Get current month start date
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Fetch total users (families)
    const { count: totalUsers } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });

    // Fetch new users this month
    const { count: newUsersThisMonth } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart);

    // Fetch total children
    const { count: totalChildren } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true });

    // Fetch new children this month
    const { count: newChildrenThisMonth } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart);

    // Fetch children by status
    const { count: activeChildren } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('status', 'Aktif');

    const { count: deceasedChildren } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('status', 'Meninggal');

    const { count: movedChildren } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('status', 'Pindah');

    const { count: inactiveChildren } = await supabaseAdmin.from('children').select('*', { count: 'exact', head: true }).eq('status', 'Tidak Aktif');

    // Fetch total measurements from result table
    const { count: totalMeasurements } = await supabaseAdmin.from('result').select('*', { count: 'exact', head: true });

    // Fetch measurements this month
    const { count: measurementsThisMonth } = await supabaseAdmin.from('result').select('*', { count: 'exact', head: true }).gte('created_at', currentMonthStart);

    return {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      totalChildren: totalChildren || 0,
      newChildrenThisMonth: newChildrenThisMonth || 0,
      activeChildren: activeChildren || 0,
      deceasedChildren: deceasedChildren || 0,
      movedChildren: movedChildren || 0,
      inactiveChildren: inactiveChildren || 0,
      totalMeasurements: totalMeasurements || 0,
      measurementsThisMonth: measurementsThisMonth || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      newUsersThisMonth: 0,
      totalChildren: 0,
      newChildrenThisMonth: 0,
      activeChildren: 0,
      deceasedChildren: 0,
      movedChildren: 0,
      inactiveChildren: 0,
      totalMeasurements: 0,
      measurementsThisMonth: 0,
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Selamat datang di sistem monitoring keluarga Innovillage</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Keluarga</CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{stats.totalUsers}</div>
            <p className="text-xs text-neutral-500 mt-1">Keluarga terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Keluarga Baru</CardTitle>
            <UserPlus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.newUsersThisMonth}</div>
            <p className="text-xs text-neutral-500 mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Anak</CardTitle>
            <Baby className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{stats.totalChildren}</div>
            <p className="text-xs text-neutral-500 mt-1">Anak terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Anak Baru</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.newChildrenThisMonth}</div>
            <p className="text-xs text-neutral-500 mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Anak Aktif</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeChildren}</div>
            <p className="text-xs text-neutral-500 mt-1">Dalam pemantauan</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Anak Tidak Aktif</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactiveChildren}</div>
            <p className="text-xs text-neutral-500 mt-1">Status tidak aktif</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Anak Meninggal</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deceasedChildren}</div>
            <p className="text-xs text-neutral-500 mt-1">Total meninggal</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Anak Pindah</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.movedChildren}</div>
            <p className="text-xs text-neutral-500 mt-1">Total pindah</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Total Pengukuran</CardTitle>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">{stats.totalMeasurements}</div>
            <p className="text-xs text-neutral-500 mt-1">Data terkumpul</p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">Pengukuran Bulan Ini</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.measurementsThisMonth}</div>
            <p className="text-xs text-neutral-500 mt-1">Data terkumpul</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
