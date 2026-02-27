'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-6">
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="lg:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input type="search" placeholder="Cari kader, laporan..." className="pl-10" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
            3
          </Badge>
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 border-l border-neutral-200 pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-neutral-900">Admin</p>
            <p className="text-xs text-neutral-500">admin@innovillage.com</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-600">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}
