'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Target, 
  CreditCard, 
  Settings,
  Menu,
  Wallet
} from 'lucide-react';
import { useState } from 'react';

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

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
            onClick={() => setOpen(false)}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Wallet className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">AppFinanzas</span>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              <NavItems />
            </nav>
          </div>
          <div className="flex-shrink-0 p-4">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-bold">AppFinanzas</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex items-center mb-8">
                  <Wallet className="h-6 w-6 text-primary" />
                  <span className="ml-2 text-lg font-bold">AppFinanzas</span>
                </div>
                <nav className="space-y-1">
                  <NavItems />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}