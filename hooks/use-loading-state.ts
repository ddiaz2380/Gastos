'use client';

import { useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';

export function useLoadingState(initialState: boolean = true, delay: number = 500) {
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(initialState);
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [initialState, delay, setLoading]);

  return setLoading;
}