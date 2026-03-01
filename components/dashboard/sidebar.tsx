'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Baby, FileText, Settings, LogOut, ChevronDown, UserCheck, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Manajemen Keluarga',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Monitoring Anak',
    icon: Baby,
    submenu: [
      {
        title: 'Data Anak',
        href: '/children',
        icon: UserCheck,
      },
      {
        title: 'Riwayat Pengukuran',
        href: '/children/measurements',
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

export function AppSidebar() {
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
    <Sidebar>
      <SidebarHeader>
        <div className="flex flex-col justify-center px-2 py-3">
          <h1 className="text-xl font-bold text-neutral-800 leading-tight">Smart Growth</h1>
          <p className="text-xs text-neutral-500 mt-1">Sistem Monitoring Pertumbuhan Anak</p>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isDisabled = item.disabled;

                // Menu dengan submenu
                if (item.submenu) {
                  const isOpen = openSubmenu === item.title;
                  const isSubmenuActive = item.submenu.some((sub) => pathname === sub.href);

                  return (
                    <Collapsible key={item.title} open={isOpen} onOpenChange={(open) => setOpenSubmenu(open ? item.title : null)}>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={isSubmenuActive}>
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isActive = pathname === subItem.href;

                              return (
                                <SidebarMenuSubItem key={subItem.href}>
                                  <SidebarMenuSubButton asChild isActive={isActive}>
                                    <Link href={subItem.href}>
                                      <SubIcon className="h-4 w-4" />
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                // Menu biasa tanpa submenu
                const isActive = pathname === item.href;

                // Menu disabled
                if (isDisabled) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton tooltip={item.title} disabled>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        <span className="ml-auto text-[10px] border border-neutral-300 px-1.5 py-0.5 rounded-md text-neutral-500">Soon</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // Menu aktif
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                      <Link href={item.href!}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
