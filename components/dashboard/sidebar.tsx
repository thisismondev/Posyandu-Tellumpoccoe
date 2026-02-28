'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Baby, FileText, Settings, LogOut, ChevronDown, UserCheck, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Manajemen Keluarga',
    href: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Monitoring Anak',
    icon: Baby,
    submenu: [
      {
        title: 'Data Anak',
        href: '/dashboard/users/children',
        icon: UserCheck,
      },
      {
        title: 'Riwayat Pengukuran',
        href: '/dashboard/users/children/measurements',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Laporan',
    href: '/dashboard/reports',
    icon: FileText,
    disabled: true,
  },
  {
    title: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
    disabled: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('Monitoring Anak');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-neutral-200 bg-white">
      {/* Logo */}
      <div className="flex flex-col justify-center h-20 border-b border-neutral-200 px-6 py-3">
        <h1 className="text-xl font-bold text-neutral-800 leading-tight">Smart Growth</h1>
        <p className="text-xs text-neutral-500 mt-1">Sistem Monitoring Pertumbuhan Anak</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isDisabled = item.disabled;

          // Menu dengan submenu
          if (item.submenu) {
            const isOpen = openSubmenu === item.title;
            const isSubmenuActive = item.submenu.some((sub) => pathname === sub.href);

            return (
              <div key={item.title}>
                <button
                  onClick={() => setOpenSubmenu(isOpen ? null : item.title)}
                  className={`flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isSubmenuActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Submenu */}
                {isOpen && (
                  <div className="ml-3 mt-1 space-y-1 border-l-2 border-neutral-200 pl-3">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isActive = pathname === subItem.href;

                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-start gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                        >
                          <SubIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{subItem.title}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Menu biasa tanpa submenu
          const isActive = pathname === item.href;
          // JIKA DISABLED: Render sebagai div/button mati, bukan Link
          if (isDisabled) {
            return (
              <div key={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 cursor-not-allowed select-none" onClick={(e) => e.preventDefault()} title="Fitur dalam pengembangan">
                <Icon className="h-5 w-5" />
                <div className="flex justify-between w-full items-center">
                  {item.title}
                  <span className="text-[10px] border border-neutral-300 px-1.5 py-0.5 rounded-md text-neutral-500">Soon</span>
                </div>
              </div>
            );
          }

          // JIKA AKTIF: Render Link normal
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <Button variant="ghost" className="w-full justify-start text-neutral-600 hover:text-neutral-900" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-3 h-5 w-5" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </aside>
  );
}
