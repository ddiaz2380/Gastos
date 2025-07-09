interface LoadingPageProps {
  message?: string;
  showProgress?: boolean;
}

export default function LoadingPage({ 
  message = "Cargando...", 
  showProgress = false 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-6 p-8">
          {/* Spinner principal */}
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-primary opacity-20"></div>
          </div>
          
          {/* Mensaje de carga */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">
              Por favor espera un momento
            </p>
          </div>
          
          {/* Barra de progreso opcional */}
          {showProgress && (
            <div className="w-64 bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}
          
          {/* Dots de carga adicionales */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
