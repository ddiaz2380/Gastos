'use client';

import { useState, useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';

interface PageLoadingWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
  minDuration?: number;
  showProgress?: boolean;
}

export function PageLoadingWrapper({ 
  children, 
  loadingMessage = 'Cargando página...',
  minDuration = 1000,
  showProgress = true 
}: PageLoadingWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const { showGlobalLoading, hideGlobalLoading } = useLoading();

  useEffect(() => {
    const startTime = Date.now();
    
    // Mostrar loading inmediatamente
    showGlobalLoading(loadingMessage, showProgress);

    const finishLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDuration - elapsedTime);

      setTimeout(() => {
        hideGlobalLoading();
        setIsReady(true);
      }, remainingTime);
    };

    // Simular carga de la página
    const timer = setTimeout(finishLoading, 100);

    return () => {
      clearTimeout(timer);
      hideGlobalLoading();
    };
  }, [loadingMessage, minDuration, showProgress]);

  return isReady ? <>{children}</> : null;
}
