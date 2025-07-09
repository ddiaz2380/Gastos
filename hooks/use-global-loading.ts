'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/components/providers/loading-provider';

const PAGE_MESSAGES: Record<string, string> = {
  '/': 'Cargando dashboard financiero...',
  '/transactions': 'Cargando historial de transacciones...',
  '/budget': 'Cargando presupuestos y categorías...',
  '/goals': 'Cargando metas financieras...',
  '/accounts': 'Cargando información de cuentas...',
  '/payments': 'Cargando métodos de pago...',
  '/settings': 'Cargando configuración...'
};

export function useGlobalLoading() {
  const pathname = usePathname();
  const { showGlobalLoading, hideGlobalLoading, isLoading } = useLoading();

  useEffect(() => {
    // Solo mostrar loading si no está ya activo
    if (!isLoading) {
      const message = PAGE_MESSAGES[pathname] || 'Cargando página...';
      showGlobalLoading(message, true);

      // Simular tiempo de carga variable según la complejidad de la página
      const loadingDuration = getLoadingDurationForPath(pathname);
      
      const timer = setTimeout(() => {
        hideGlobalLoading();
      }, loadingDuration);

      return () => {
        clearTimeout(timer);
        hideGlobalLoading();
      };
    }
    
    // Retornar función de limpieza vacía si no se ejecuta el loading
    return () => {};
  }, [pathname, isLoading]);

  return { pathname };
}

function getLoadingDurationForPath(pathname: string): number {
  const durations: Record<string, number> = {
    '/': 2000,           // Dashboard - más complejo
    '/transactions': 1800, // Transacciones - datos complejos
    '/budget': 1500,      // Presupuesto - cálculos
    '/goals': 1600,       // Metas - análisis
    '/accounts': 1400,    // Cuentas - datos simples
    '/payments': 1300,    // Pagos - verificaciones
    '/settings': 1200     // Configuración - básico
  };

  return durations[pathname] || 1500;
}
