'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HeaderProps } from '@/types/header';

export function Header({ user }: HeaderProps) {
  return (
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
          <p className="text-sm font-medium text-neutral-900">{user.name}</p>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-neutral-200 text-neutral-600">{user.name?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
