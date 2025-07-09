'use client';

import React, { createContext, useContext, useState } from 'react';
import { AdvancedLoading } from '@/components/ui/advanced-loading';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  showProgress: boolean;
  setShowProgress: (show: boolean) => void;
  showGlobalLoading: (message?: string, showProgress?: boolean) => void;
  hideGlobalLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Cargando...');
  const [showProgress, setShowProgress] = useState(true);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setMessageValue = (msg: string) => {
    setMessage(msg);
  };

  const setShowProgressValue = (show: boolean) => {
    setShowProgress(show);
  };

  const showGlobalLoading = (msg: string = 'Cargando...', progress: boolean = true) => {
    setMessage(msg);
    setShowProgress(progress);
    setIsLoading(true);
  };

  const hideGlobalLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider 
      value={{
        isLoading,
        setLoading,
        message,
        setMessage: setMessageValue,
        showProgress,
        setShowProgress: setShowProgressValue,
        showGlobalLoading,
        hideGlobalLoading
      }}
    >
      {children}
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <AdvancedLoading 
          message={message} 
          showProgress={showProgress}
          duration={2000}
        />
      )}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    // Return a mock implementation to avoid breaking existing code
    return {
      isLoading: false,
      setLoading: () => {},
      message: '',
      setMessage: () => {},
      showProgress: false,
      setShowProgress: () => {},
      showGlobalLoading: () => {},
      hideGlobalLoading: () => {}
    };
  }
  return context;
};