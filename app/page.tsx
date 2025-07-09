'use client';

import { useState, useEffect } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { BudgetOverview } from '@/components/dashboard/budget-overview';
import { FinancialGoals } from '@/components/dashboard/financial-goals';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ClientOnly } from '@/components/ui/client-only';
import { useConfirmation } from '@/hooks/use-confirmation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Bell,
  Star,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const confirmation = useConfirmation();

  // Usar el sistema de loading para esta página
  const { isPageLoading } = usePageLoading({
    message: 'Cargando dashboard financiero...',
    minDuration: 2000,
    showProgress: true,
    simulateDataFetch: true
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full animate-in fade-in duration-700" suppressHydrationWarning>
      {/* No mostrar contenido si está cargando */}
      {isPageLoading ? null : (
        <>
          {/* Enhanced Header with Real-time Info */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-6 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {greeting}, Usuario
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Tu centro de control financiero está listo
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:items-end gap-2" suppressHydrationWarning>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg">
                {mounted ? formatTime(currentTime) : '--:--:--'}
              </span>
            </div>
            <p className="text-blue-200 text-sm capitalize">
              {mounted ? formatDate(currentTime) : 'Cargando fecha...'}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Activity className="h-3 w-3 mr-1" />
                En línea
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Sincronizado
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {mounted && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoy</p>
                  <p className="text-lg font-bold text-green-600">+$1,250</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <p className="text-lg font-bold text-red-600">-$340</p>
                </div>
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-lg font-bold text-blue-600">78%</p>
                </div>
                <Target className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ahorro</p>
                  <p className="text-lg font-bold text-purple-600">$2,890</p>
                </div>
                <Star className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Overview Cards */}
      <div className="w-full">
        <OverviewCards />
      </div>

      {/* Advanced Tabs System */}
      {mounted && (
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="spending" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Acciones</span>
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <SpendingChart />
        </TabsContent>
        
        <TabsContent value="spending" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SpendingChart />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumen Rápido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Alimentación</span>
                      <span className="font-medium">$450</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transporte</span>
                      <span className="font-medium">$230</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Entretenimiento</span>
                      <span className="font-medium">$180</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-6 mt-6">
          <FinancialGoals />
        </TabsContent>          <TabsContent value="actions" className="space-y-6 mt-6">
            <QuickActions />
          </TabsContent>
        </Tabs>
      )}

      {/* Enhanced Bottom Section */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 w-full">
        <div className="lg:col-span-2 w-full">
          <RecentTransactions />
        </div>
        <div className="w-full space-y-6">
          <BudgetOverview />
          
          {/* Notifications Panel */}
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Presupuesto excedido</p>
                  <p className="text-xs text-muted-foreground">Categoría: Entretenimiento</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Meta alcanzada</p>
                  <p className="text-xs text-muted-foreground">Ahorro mensual completado</p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                Ver todas las notificaciones
              </Button>
            </CardContent>
          </Card>

          {/* Demo Confirmation Buttons */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <CheckCircle2 className="h-5 w-5" />
                Demo Confirmaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Prueba los diferentes tipos de confirmación
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => confirmation.showTransferConfirmation({
                    amount: '1,250.00',
                    currency: 'ARS',
                    from: 'Cuenta Corriente',
                    to: 'Cuenta Ahorros',
                    description: 'Transferencia demo',
                    id: 'DEMO-TRANSFER-001'
                  })}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Transferencia
                </Button>
                <Button 
                  onClick={() => confirmation.showPaymentConfirmation({
                    amount: '89.99',
                    currency: 'ARS',
                    category: 'Servicios',
                    description: 'Pago de Internet',
                    method: 'Tarjeta de Débito',
                    id: 'DEMO-PAYMENT-001'
                  })}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Pago
                </Button>
                <Button 
                  onClick={() => confirmation.showGoalConfirmation({
                    amount: '15,000.00',
                    currency: 'ARS',
                    goal: 'Vacaciones 2025',
                    action: 'updated',
                    description: 'Progreso en meta de vacaciones',
                    id: 'DEMO-GOAL-001'
                  })}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Meta
                </Button>
                <Button 
                  onClick={() => confirmation.showBudgetConfirmation({
                    amount: '3,500.00',
                    currency: 'ARS',
                    category: 'Alimentación',
                    action: 'updated',
                    period: 'Enero 2025',
                    description: 'Presupuesto mensual actualizado',
                    id: 'DEMO-BUDGET-001'
                  })}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Presupuesto
                </Button>
              </div>
              <Button 
                onClick={() => setShowConfirmation(true)}
                className="w-full mt-2"
                size="sm"
              >
                Modal Integrado
              </Button>
              <Button 
                onClick={() => confirmation.showTransactionConfirmation({
                  amount: '500.00',
                  currency: 'ARS',
                  category: 'Alimentación',
                  type: 'expense',
                  description: 'Compra en supermercado',
                  account: 'Cuenta Corriente',
                  id: 'DEMO-TXN-001'
                })}
                variant="secondary"
                className="w-full mt-1"
                size="sm"
              >
                Transacción Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ClientOnly>
        {showConfirmation && (
          <ConfirmationModal
            type="transfer"
            title="Transferencia Exitosa"
            amount="1,250.00"
            currency="USD"
            fromAccount="Cuenta Corriente"
            toAccount="Cuenta de Ahorros"
            description="Transferencia mensual para ahorros"
            transactionId="TXN-2025-001234"
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onViewDetails={() => {
              setShowConfirmation(false);
              // Aquí podrías navegar a la página de detalles
            }}
          />
        )}
      </ClientOnly>
        </>
      )}
    </div>
  );
}