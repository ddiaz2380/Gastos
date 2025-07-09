'use client';

import { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const sidebar = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by rendering a simpler version on server
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex relative">
          <Sidebar isOpen={true} onClose={() => {}} />
          <div className="flex-1 flex flex-col md:ml-64">
            <Header sidebarOpen={true} setSidebarOpen={() => {}} />
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebar.isOpen} onClose={sidebar.close} />
        
        {/* Header + Main Content Area */}
        <div 
          className={cn(
            "flex-1 flex flex-col layout-transition will-change-transform",
            sidebar.isOpen ? "md:ml-64" : "md:ml-0"
          )}
        >
          {/* Header */}
          <Header sidebarOpen={sidebar.isOpen} setSidebarOpen={sidebar.toggle} />
          
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
