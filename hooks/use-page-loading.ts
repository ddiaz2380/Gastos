'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/components/providers/loading-provider';
import { usePathname } from 'next/navigation';

interface UsePageLoadingOptions {
  message?: string;
  minDuration?: number;
  showProgress?: boolean;
  simulateDataFetch?: boolean;
}

export function usePageLoading(options: UsePageLoadingOptions = {}) {
  const {
    message = 'Cargando página...',
    minDuration = 1500,
    showProgress = true,
    simulateDataFetch = true
  } = options;

  const { showGlobalLoading, hideGlobalLoading } = useLoading();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Mostrar loading al cambiar de página
    setIsPageLoading(true);
    showGlobalLoading(message, showProgress);

    const loadPage = async () => {
      const startTime = Date.now();

      try {
        // Simular carga de datos si está habilitado
        if (simulateDataFetch) {
          await simulateDataLoading(pathname);
        }

        // Asegurar duración mínima para UX consistente
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minDuration - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
      } catch (error) {
        console.error('Error durante la carga de la página:', error);
      } finally {
        hideGlobalLoading();
        setIsPageLoading(false);
      }
    };

    loadPage();

    // Cleanup en desmontaje del componente
    return () => {
      hideGlobalLoading();
    };
  }, [pathname, message, minDuration, showProgress, simulateDataFetch]);

  return { isPageLoading };
}

// Simula carga de datos específica por página
async function simulateDataLoading(pathname: string): Promise<void> {
  const loadingSteps = getLoadingStepsForPath(pathname);
  
  for (let i = 0; i < loadingSteps.length; i++) {
    // Simular tiempo variable para cada paso
    const delay = Math.random() * 400 + 200; // 200-600ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

function getLoadingStepsForPath(pathname: string): string[] {
  const pathMap: Record<string, string[]> = {
    '/': [
      'Cargando dashboard...',
      'Obteniendo datos financieros...',
      'Calculando estadísticas...',
      'Preparando gráficos...'
    ],
    '/transactions': [
      'Cargando transacciones...',
      'Obteniendo historial...',
      'Calculando análisis...',
      'Preparando filtros...'
    ],
    '/budget': [
      'Cargando presupuestos...',
      'Obteniendo categorías...',
      'Calculando gastos...',
      'Preparando comparativas...'
    ],
    '/goals': [
      'Cargando metas financieras...',
      'Obteniendo progreso...',
      'Calculando proyecciones...',
      'Preparando timeline...'
    ],
    '/accounts': [
      'Cargando cuentas...',
      'Obteniendo balances...',
      'Sincronizando datos...',
      'Preparando resumen...'
    ],
    '/payments': [
      'Cargando pagos...',
      'Obteniendo métodos...',
      'Verificando estado...',
      'Preparando historial...'
    ],
    '/settings': [
      'Cargando configuración...',
      'Obteniendo preferencias...',
      'Verificando permisos...',
      'Preparando opciones...'
    ]
  };

  return pathMap[pathname] || [
    'Cargando página...',
    'Obteniendo datos...',
    'Preparando interfaz...'
  ];
}

// Hook para simular carga de datos específicos
export function useDataLoading<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  loadingMessage: string = 'Cargando datos...'
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showGlobalLoading, hideGlobalLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        showGlobalLoading(loadingMessage, true);

        // Simular latencia de red real
        const delay = Math.random() * 800 + 500; // 500-1300ms
        await new Promise(resolve => setTimeout(resolve, delay));

        const result = await fetchFn();
        
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          hideGlobalLoading();
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      hideGlobalLoading();
    };
  }, deps);

  return { data, isLoading, error, refetch: () => setIsLoading(true) };
}
