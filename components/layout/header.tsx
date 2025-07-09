'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { 
  Menu,
  X,
  Maximize,
  Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left side - Hamburger menu */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 transition-all duration-200 ease-in-out hover:bg-accent hover:scale-110"
            aria-label={sidebarOpen ? 'Ocultar sidebar' : 'Mostrar sidebar'}
            suppressHydrationWarning
          >
            <div className="relative h-4 w-4" suppressHydrationWarning>
              {mounted ? (
                <>
                  <Menu 
                    className={cn(
                      "absolute h-4 w-4 transition-all duration-300 ease-in-out",
                      sidebarOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                    )}
                  />
                  <X 
                    className={cn(
                      "absolute h-4 w-4 transition-all duration-300 ease-in-out",
                      sidebarOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                    )}
                  />
                </>
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </div>
          </Button>
          
          {/* Page title for mobile */}
          <div className="md:hidden">
            <h1 className="text-lg font-semibold text-foreground">Mis Gastos</h1>
          </div>
        </div>

        {/* Right side - Theme toggle and fullscreen */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-9 w-9 transition-all duration-200 ease-in-out hover:bg-accent hover:scale-110"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            suppressHydrationWarning
          >
            {mounted ? (
              isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}