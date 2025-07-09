'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedLoadingProps {
  message?: string;
  showProgress?: boolean;
  duration?: number;
}

export function AdvancedLoading({ 
  message = "Cargando...", 
  showProgress = true,
  duration = 2000
}: AdvancedLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showLogo, setShowLogo] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const loadingMessages = [
    "Inicializando aplicación...",
    "Configurando seguridad...",
    "Cargando datos financieros...",
    "Preparando dashboard...",
    "Casi listo..."
  ];

  useEffect(() => {
    setShowLogo(true);
    
    let progressTimer: NodeJS.Timeout | undefined;
    let messageTimer: NodeJS.Timeout | undefined;
    
    if (showProgress) {
      // Simular progreso real con pasos más naturales
      const progressSteps = [0, 15, 35, 50, 70, 85, 100];
      let currentStep = 0;
      
      const updateProgress = () => {
        if (currentStep < progressSteps.length) {
          const progressValue = progressSteps[currentStep];
          if (progressValue !== undefined) {
            setProgress(progressValue);
          }
          
          // Actualizar mensaje en ciertos puntos
          if (currentStep < loadingMessages.length) {
            const messageValue = loadingMessages[currentStep];
            if (messageValue !== undefined) {
              setCurrentMessage(messageValue);
            }
          }
          
          currentStep++;
          
          // Intervalos variables para simular carga real
          const delays = [300, 500, 400, 600, 450, 350, 200];
          const nextDelay = delays[currentStep - 1] || 200;
          
          if (currentStep < progressSteps.length) {
            progressTimer = setTimeout(updateProgress, nextDelay);
          }
        }
      };
      
      // Iniciar después de un pequeño delay para mostrar la animación del logo
      setTimeout(updateProgress, 500);
    } else {
      // Sin progreso, solo incrementar gradualmente
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + Math.random() * 15 + 5;
        });
      }, 200);
    }

    return () => {
      if (progressTimer) clearTimeout(progressTimer);
      if (messageTimer) clearTimeout(messageTimer);
    };
  }, [showProgress]);

  return (
    <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-150"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-300"></div>
        <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse-glow animation-delay-450"></div>
      </div>

      {/* Curtain animation container */}
      <div className={cn(
        "absolute inset-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm transition-all duration-500",
        isExiting ? "animate-curtain-up" : "animate-curtain-down"
      )}>
        
        {/* Main content */}
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-8 px-8">
            
            {/* Logo and brand */}
            <div className={cn(
              "transition-all duration-700 ease-out",
              showLogo ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-4"
            )}>
              <div className="relative mb-6">
                {/* Logo principal */}
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full animate-pulse-glow"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl">
                    <DollarSign className="w-10 h-10 text-white animate-bounce-gentle" />
                  </div>
                </div>
                
                {/* Brand name */}
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-wide">
                  Mis Gastos
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                  Gestión Financiera Inteligente
                </p>
              </div>
            </div>

            {/* Loading message */}
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-slate-200 text-lg font-medium min-h-[28px] transition-all duration-300">
                {currentMessage}
              </p>
              
              {/* Loading dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-0"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-300"></div>
              </div>
            </div>

            {/* Progress bar */}
            {showProgress && (
              <div className="w-80 max-w-full mx-auto space-y-3">
                <div className="relative">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out relative"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                  </div>
                  
                  {/* Progress percentage */}
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Cargando</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Feature icons */}
            <div className={cn(
              "flex justify-center space-x-8 transition-all duration-1000 delay-500",
              showLogo ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Análisis</span>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <PiggyBank className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Ahorros</span>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Presupuestos</span>
              </div>
            </div>

          </div>
        </div>

        {/* Loading completed indicator */}
        {progress >= 100 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-green-600 animate-fade-in">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">¡Listo!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdvancedLoading;
