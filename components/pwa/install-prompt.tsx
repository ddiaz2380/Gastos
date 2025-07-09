'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      
      console.log('PWA Install Check:', {
        isStandalone,
        isIOSStandalone,
        isAndroidApp,
        userAgent: navigator.userAgent
      });
      
      if (isStandalone || isIOSStandalone || isAndroidApp) {
        setIsInstalled(true);
        setDebugInfo('App ya está instalada');
        return;
      }
      
      setDebugInfo('App no está instalada');
    };

    checkIfInstalled();

    // Check if prompt was dismissed in this session
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      setDebugInfo('Prompt fue descartado en esta sesión');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('beforeinstallprompt event fired', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setDebugInfo('Evento beforeinstallprompt recibido');
      
      // Show prompt after a delay if not installed and not dismissed
      if (!isInstalled && !wasDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
          setIsVisible(true);
          setDebugInfo('Mostrando prompt de instalación');
        }, 3000); // Show after 3 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('App installed event fired');
      setIsInstalled(true);
      setShowPrompt(false);
      setIsVisible(false);
      setDeferredPrompt(null);
      setDebugInfo('App instalada exitosamente');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For testing: show prompt after 5 seconds if no beforeinstallprompt event
    const testTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !wasDismissed) {
        console.log('No beforeinstallprompt event detected, showing test prompt');
        setShowPrompt(true);
        setIsVisible(true);
        setDebugInfo('Modo de prueba: mostrando prompt sin evento');
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(testTimer);
    };
  }, [isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsVisible(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsVisible(false);
    
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  return (
    <>

      {/* Install prompt */}
      {(showPrompt && !isInstalled) && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out transform",
            isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-full opacity-0 scale-95"
          )}
        >
          <Card className="w-80 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    ¡Instala Mis Gastos!
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Accede más rápido a tu gestión financiera. Instala la app en tu dispositivo.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstallClick}
                      size="sm"
                      className="flex-1 h-8 text-xs font-medium"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Instalar
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      Ahora no
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}