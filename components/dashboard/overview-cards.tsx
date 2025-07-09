'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
  Target,
  Calendar,
  Zap,
  Activity,
  BarChart3,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Percent
} from 'lucide-react';

interface OverviewData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  savingsRate: number;
  budgetUsed: number;
  goalProgress: number;
  lastUpdate: string;
  trends: {
    balance: number;
    income: number;
    expenses: number;
    savings: number;
  };
  alerts: {
    type: 'warning' | 'success' | 'info';
    message: string;
  }[];
}

export function OverviewCards() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData({
          ...dashboardData.overview,
          savingsRate: 28.9,
          budgetUsed: 71.2,
          goalProgress: 65.4,
          lastUpdate: new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          trends: {
            balance: 5.2,
            income: 8.1,
            expenses: -3.4,
            savings: 12.7
          },
          alerts: [
            {
              type: 'warning',
              message: 'Gastos en entretenimiento 15% por encima del presupuesto'
            },
            {
              type: 'success',
              message: 'Meta de ahorro mensual alcanzada'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount: number, hideValue = false) => {
    if (hideValue) return '••••••';
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-28"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center text-muted-foreground">
          Error al cargar los datos
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Resumen Financiero</h2>
          <p className="text-muted-foreground">
            Última actualización: {data?.lastUpdate} • 
            <span className="text-green-600 font-medium">Todo al día</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isBalanceVisible ? 
              <Eye className="h-4 w-4 text-gray-600" /> : 
              <EyeOff className="h-4 w-4 text-gray-600" />
            }
          </button>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {data.alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : alert.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
              {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {alert.type === 'info' && <Clock className="h-4 w-4" />}
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Balance Total */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Saldo Total</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-blue-900">
                {formatCurrency(data?.totalBalance || 0, !isBalanceVisible)}
              </p>
              <div className="flex items-center gap-2">
                {getTrendIcon(data?.trends.balance || 0)}
                <span className={`text-sm font-medium ${getTrendColor(data?.trends.balance || 0)}`}>
                  {data?.trends.balance > 0 ? '+' : ''}{data?.trends.balance}% vs mes anterior
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progreso anual</span>
                <span className="font-medium">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Ingresos Mensuales */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Ingresos Mensuales</CardTitle>
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(data?.monthlyIncome || 0, !isBalanceVisible)}
              </p>
              <div className="flex items-center gap-2">
                {getTrendIcon(data?.trends.income || 0)}
                <span className={`text-sm font-medium ${getTrendColor(data?.trends.income || 0)}`}>
                  {data?.trends.income > 0 ? '+' : ''}{data?.trends.income}% vs mes anterior
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Meta mensual</span>
                <span className="font-medium">90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Gastos Mensuales */}
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Gastos Mensuales</CardTitle>
              <div className="p-2 bg-red-500 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-3xl font-bold text-red-900">
                {formatCurrency(data?.monthlyExpenses || 0, !isBalanceVisible)}
              </p>
              <div className="flex items-center gap-2">
                {getTrendIcon(data?.trends.expenses || 0)}
                <span className={`text-sm font-medium ${getTrendColor(data?.trends.expenses || 0)}`}>
                  {data?.trends.expenses > 0 ? '+' : ''}{data?.trends.expenses}% vs mes anterior
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Presupuesto usado</span>
                <span className="font-medium">{data?.budgetUsed}%</span>
              </div>
              <Progress value={data?.budgetUsed || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Ahorros */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Tasa de Ahorro</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-purple-900">
                  {data?.savingsRate}%
                </p>
                <span className="text-sm text-muted-foreground">
                  ({formatCurrency(data?.netIncome || 0, !isBalanceVisible)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(data?.trends.savings || 0)}
                <span className={`text-sm font-medium ${getTrendColor(data?.trends.savings || 0)}`}>
                  {data?.trends.savings > 0 ? '+' : ''}{data?.trends.savings}% vs mes anterior
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Meta de ahorro</span>
                <span className="font-medium">{data?.goalProgress}%</span>
              </div>
              <Progress value={data?.goalProgress || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 bg-gray-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gray-500 rounded-full">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">${((data?.monthlyIncome || 0) / 30).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Ingreso promedio diario</p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 bg-gray-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gray-500 rounded-full">
                <Target className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">${((data?.monthlyExpenses || 0) / 30).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Gasto promedio diario</p>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 bg-gray-50/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-gray-500 rounded-full">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900">{Math.ceil((data?.netIncome || 0) / ((data?.monthlyExpenses || 1) / 30))}</p>
            <p className="text-xs text-muted-foreground">Días de gastos cubiertos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}