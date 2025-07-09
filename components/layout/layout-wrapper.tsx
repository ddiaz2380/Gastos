'use client';

import { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { useGlobalLoading } from '@/hooks/use-global-loading';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const sidebar = useSidebar();
  
  // Desactivar loading automático global por ahora para evitar conflictos
  // useGlobalLoading();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use consistent structure for both server and client
  // On server: sidebar is open (desktop default)
  // On client: use actual sidebar state once mounted
  const sidebarOpen = mounted ? sidebar.isOpen : true;
  const handleSidebarToggle = mounted ? sidebar.toggle : () => {};
  const handleSidebarClose = mounted ? sidebar.close : () => {};

  return (
    <div className="min-h-screen bg-background">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        {/* Header + Main Content Area */}
        <div 
          className={cn(
            "flex-1 flex flex-col layout-transition will-change-transform",
            sidebarOpen ? "md:ml-64" : "md:ml-0"
          )}
          suppressHydrationWarning
        >
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={handleSidebarToggle} />
          
          {/* Main Content */}
          <main className="flex-1 w-full min-h-[calc(100vh-4rem)]">
            <div className="p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full">
              <div className="w-full max-w-[90rem] mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}