'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  CreditCard, 
  Settings,
  Wallet
} from 'lucide-react';

const navigation = [
  {
    name: 'Panel',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    icon: ArrowLeftRight,
  },
  {
    name: 'Presupuesto',
    href: '/budget',
    icon: PieChart,
  },
  {
    name: 'Metas',
    href: '/goals',
    icon: Target,
  },
  {
    name: 'Cuentas',
    href: '/accounts',
    icon: Wallet,
  },
  {
    name: 'Pagos',
    href: '/payments',
    icon: CreditCard,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMobileNavClick = () => {
    // Close sidebar on mobile when a nav item is clicked
    if (onClose && mounted && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:top-14 md:z-40 sidebar-transition will-change-transform shadow-lg bg-background border-r",
          isOpen ? "md:w-64 md:translate-x-0" : "md:w-0 md:-translate-x-full"
        )}
        suppressHydrationWarning
      >
        <div className={cn(
          "flex flex-col h-full w-64 overflow-hidden layout-transition will-change-contents",
          isOpen ? "opacity-100" : "opacity-0"
        )} suppressHydrationWarning>
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 h-14">
            <Wallet className="h-8 w-8 text-primary animate-pulse hover:animate-spin transition-all duration-300" />
            <span className="ml-2 text-xl font-bold whitespace-nowrap text-foreground">Mis Gastos</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-105 whitespace-nowrap',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mounted && isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-enhanced animate-fade-in" 
          onClick={onClose} 
        />
      )}
      
      {/* Mobile Sidebar */}
      <div 
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-background border-r shadow-lg sidebar-transition will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        suppressHydrationWarning
      >
        <div className="flex flex-col h-full pt-14">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 h-14">
            <Wallet className="h-8 w-8 text-primary animate-pulse hover:animate-spin transition-all duration-300" />
            <span className="ml-2 text-xl font-bold text-foreground">Mis Gastos</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleMobileNavClick}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:scale-105',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}