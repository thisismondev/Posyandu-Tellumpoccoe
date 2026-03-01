import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AppSidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Footer } from '@/components/dashboard/footer';
import { SessionMonitor } from '@/components/session-monitor';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      {/* Session Monitor - auto-check session validity */}
      <SessionMonitor />

      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <SidebarInset>
        {/* Header with Sidebar Trigger */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Header user={user} />
        </header>

        {/* Page Content */}
        <main className="flex flex-1 flex-col gap-4 p-6 bg-neutral-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
