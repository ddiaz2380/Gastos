'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart, 
  BarChart3,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Activity,
  CreditCard,
  Wallet,
  Calculator,
  LineChart,
  Eye,
  Settings,
  RefreshCw,
  Share2,
  FileText,
  Mail,
  Bell,
  Star,
  Bookmark,
  Search,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Hash,
  MapPin,
  Building,
  CreditCard as Card2,
  Banknote,
  Coins,
  Receipt,
  ShoppingCart,
  Home,
  Car,
  Plane,
  Coffee,
  Gamepad2,
  Music,
  Book,
  Heart,
  Shield,
  Briefcase
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, addMonths, differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface PaymentAnalytics {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  onTimePercentage: number;
  averagePaymentAmount: number;
  monthlyTrend: Array<{
    month: string;
    paid: number;
    pending: number;
    overdue: number;
    total: number;
    growth: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
    trend: number;
    icon: string;
  }>;
  upcomingPayments: Array<{
    id: string;
    name: string;
    amount: number;
    due_date: string;
    category: string;
    priority: string;
    days_until_due: number;
    auto_pay: boolean;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  geographicData: Array<{
    region: string;
    amount: number;
    count: number;
  }>;
  deviceData: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  timePatterns: {
    hourly: Array<{ hour: number; count: number }>;
    daily: Array<{ day: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  predictions: {
    nextMonthAmount: number;
    nextMonthGrowth: number;
    riskScore: number;
    cashFlowForecast: Array<{
      date: string;
      predicted: number;
      confidence: number;
    }>;
  };
  comparisons: {
    previousPeriod: {
      amount: number;
      growth: number;
      payments: number;
    };
    yearOverYear: {
      amount: number;
      growth: number;
      payments: number;
    };
  };
  efficiency: {
    automationRate: number;
    averageProcessingTime: number;
    failureRate: number;
    costPerTransaction: number;
  };
}

interface PaymentInsight {
  type: 'warning' | 'success' | 'info' | 'critical';
  title: string;
  description: string;
  action?: string;
  priority: number;
  category: string;
  impact: 'high' | 'medium' | 'low';
}

interface FilterOptions {
  dateRange: string;
  category: string;
  paymentMethod: string;
  status: string;
  amountRange: { min: number; max: number };
  showPredictions: boolean;
  showComparisons: boolean;
  groupBy: string;
}

export default function PaymentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [insights, setInsights] = useState<PaymentInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: '6months',
    category: 'all',
    paymentMethod: 'all',
    status: 'all',
    amountRange: { min: 0, max: 10000 },
    showPredictions: true,
    showComparisons: true,
    groupBy: 'month'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'chart'>('cards');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['amount', 'count', 'growth']);
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadAnalytics, 300000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
    return () => {}; // Return cleanup function even when autoRefresh is false
  }, [autoRefresh]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAnalytics: PaymentAnalytics = {
        totalPayments: 156,
        totalAmount: 45230.50,
        paidAmount: 38940.25,
        pendingAmount: 4890.75,
        overdueAmount: 1399.50,
        onTimePercentage: 86.2,
        averagePaymentAmount: 290.07,
        monthlyTrend: [
          { month: 'Jul', paid: 7200, pending: 1100, overdue: 200, total: 8500, growth: -5.2 },
          { month: 'Ago', paid: 8500, pending: 1200, overdue: 300, total: 10000, growth: 17.6 },
          { month: 'Sep', paid: 9200, pending: 800, overdue: 150, total: 10150, growth: 1.5 },
          { month: 'Oct', paid: 7800, pending: 1500, overdue: 400, total: 9700, growth: -4.4 },
          { month: 'Nov', paid: 10100, pending: 900, overdue: 200, total: 11200, growth: 15.5 },
          { month: 'Dic', paid: 9500, pending: 1300, overdue: 100, total: 10900, growth: -2.7 }
        ],
        categoryBreakdown: [
          { category: 'Servicios', amount: 15420.30, count: 45, percentage: 34.1, trend: 8.5, icon: 'Zap' },
          { category: 'Proveedores', amount: 12890.75, count: 38, percentage: 28.5, trend: -2.1, icon: 'Building' },
          { category: 'Nómina', amount: 8950.20, count: 25, percentage: 19.8, trend: 12.3, icon: 'Users' },
          { category: 'Impuestos', amount: 5670.15, count: 18, percentage: 12.5, trend: 0.8, icon: 'Receipt' },
          { category: 'Otros', amount: 2299.10, count: 30, percentage: 5.1, trend: -15.2, icon: 'MoreHorizontal' }
        ],
        upcomingPayments: [
          {
            id: '1',
            name: 'Pago de servicios públicos',
            amount: 450.00,
            due_date: '2024-01-15',
            category: 'Servicios',
            priority: 'high',
            days_until_due: 3,
            auto_pay: true
          },
          {
            id: '2',
            name: 'Proveedor ABC',
            amount: 1200.50,
            due_date: '2024-01-18',
            category: 'Proveedores',
            priority: 'medium',
            days_until_due: 6,
            auto_pay: false
          },
          {
            id: '3',
            name: 'Impuesto mensual',
            amount: 890.25,
            due_date: '2024-01-20',
            category: 'Impuestos',
            priority: 'high',
            days_until_due: 8,
            auto_pay: true
          }
        ],
        paymentMethods: [
          { method: 'Transferencia Bancaria', count: 89, amount: 28450.30, percentage: 62.9 },
          { method: 'Tarjeta de Crédito', count: 34, amount: 9870.25, percentage: 21.8 },
          { method: 'Efectivo', count: 21, amount: 4560.75, percentage: 10.1 },
          { method: 'Cheque', count: 12, amount: 2349.20, percentage: 5.2 }
        ],
        geographicData: [
          { region: 'Ciudad de México', amount: 18920.50, count: 67 },
          { region: 'Guadalajara', amount: 12450.25, count: 43 },
          { region: 'Monterrey', amount: 8760.75, count: 28 },
          { region: 'Puebla', amount: 5099.00, count: 18 }
        ],
        deviceData: [
          { device: 'Desktop', count: 89, percentage: 57.1 },
          { device: 'Mobile', count: 45, percentage: 28.8 },
          { device: 'Tablet', count: 22, percentage: 14.1 }
        ],
        timePatterns: {
          hourly: [
            { hour: 9, count: 23 }, { hour: 10, count: 31 }, { hour: 11, count: 28 },
            { hour: 14, count: 35 }, { hour: 15, count: 29 }, { hour: 16, count: 18 }
          ],
          daily: [
            { day: 'Lun', count: 28 }, { day: 'Mar', count: 32 }, { day: 'Mié', count: 25 },
            { day: 'Jue', count: 31 }, { day: 'Vie', count: 27 }, { day: 'Sáb', count: 8 }, { day: 'Dom', count: 5 }
          ],
          monthly: [
            { month: 'Ene', count: 145 }, { month: 'Feb', count: 132 }, { month: 'Mar', count: 156 },
            { month: 'Abr', count: 148 }, { month: 'May', count: 162 }, { month: 'Jun', count: 139 }
          ]
        },
        predictions: {
          nextMonthAmount: 47850.25,
          nextMonthGrowth: 5.8,
          riskScore: 23.5,
          cashFlowForecast: [
            { date: '2024-01-15', predicted: 12500, confidence: 0.89 },
            { date: '2024-01-30', predicted: 23400, confidence: 0.82 },
            { date: '2024-02-15', predicted: 35200, confidence: 0.75 },
            { date: '2024-02-28', predicted: 47850, confidence: 0.71 }
          ]
        },
        comparisons: {
          previousPeriod: {
            amount: 42180.30,
            growth: 7.2,
            payments: 142
          },
          yearOverYear: {
            amount: 38950.75,
            growth: 16.1,
            payments: 134
          }
        },
        efficiency: {
          automationRate: 73.2,
          averageProcessingTime: 2.4,
          failureRate: 1.8,
          costPerTransaction: 3.45
        }
      };
      
      const mockInsights: PaymentInsight[] = [
        {
          type: 'critical',
          title: 'Pagos Vencidos Críticos',
          description: 'Tienes 3 pagos vencidos por un total de $1,399.50 que requieren atención inmediata',
          action: 'Revisar pagos vencidos',
          priority: 1,
          category: 'Riesgo',
          impact: 'high'
        },
        {
          type: 'warning',
          title: 'Flujo de Efectivo Bajo',
          description: 'Se prevé un flujo de efectivo bajo para la próxima semana',
          action: 'Revisar presupuesto',
          priority: 2,
          category: 'Finanzas',
          impact: 'medium'
        },
        {
          type: 'success',
          title: 'Mejora en Automatización',
          description: 'La tasa de automatización ha aumentado al 73.2%, ahorrando tiempo y reduciendo errores',
          priority: 3,
          category: 'Eficiencia',
          impact: 'medium'
        },
        {
          type: 'info',
          title: 'Patrón de Pagos Detectado',
          description: 'Los pagos se concentran principalmente entre las 14:00 y 16:00 horas',
          priority: 4,
          category: 'Análisis',
          impact: 'low'
        },
        {
          type: 'success',
          title: 'Crecimiento Mensual Positivo',
          description: 'El volumen de pagos ha crecido un 7.2% comparado con el período anterior',
          priority: 5,
          category: 'Crecimiento',
          impact: 'high'
        }
      ];
      
      setAnalytics(mockAnalytics);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Error al cargar los análisis');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    toast.success('Datos actualizados correctamente');
  };

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadAnalytics(); // Recargar datos con nuevos filtros
  };

  const exportReport = async () => {
    try {
      toast.success(`Exportando reporte en formato ${exportFormat.toUpperCase()}...`);
      
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        analytics,
        insights,
        filters,
        generatedAt: new Date().toISOString(),
        reportType: 'comprehensive_payment_analytics'
      };
      
      // En una implementación real, aquí se generaría el archivo
      console.log('Report data:', reportData);
      
      toast.success(`Reporte exportado exitosamente en formato ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error('Error al exportar el reporte');
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Zap, Building, Users, Receipt, MoreHorizontal: Target,
      CreditCard, Wallet, Banknote, Coins
    };
    const IconComponent = icons[iconName] || Target;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'info': return <Target className="h-5 w-5 text-blue-500" />;
      default: return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'success': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'info': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando análisis avanzados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Análisis Completo de Pagos
            </h1>
            <p className="text-gray-600">Dashboard avanzado con insights, predicciones y análisis detallados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            disabled={refreshing}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setExportFormat(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setActiveTab('settings')} variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-refresh" className="text-sm">Auto-actualizar</Label>
              <Switch 
                id="auto-refresh"
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh} 
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Período</Label>
              <Select value={filters.dateRange} onValueChange={(value) => updateFilters({ dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Último mes</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Categoría</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="services">Servicios</SelectItem>
                  <SelectItem value="suppliers">Proveedores</SelectItem>
                  <SelectItem value="payroll">Nómina</SelectItem>
                  <SelectItem value="taxes">Impuestos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Método de Pago</Label>
              <Select value={filters.paymentMethod} onValueChange={(value) => updateFilters({ paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="bank_transfer">Transferencia</SelectItem>
                  <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Vista</Label>
              <Select value={viewMode} onValueChange={(value: 'cards' | 'table' | 'chart') => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">Tarjetas</SelectItem>
                  <SelectItem value="table">Tabla</SelectItem>
                  <SelectItem value="chart">Gráficos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar pagos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Fecha Inicio</Label>
                <Input 
                  type="date" 
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Fecha Fin</Label>
                <Input 
                  type="date" 
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Switch 
                checked={filters.showPredictions} 
                onCheckedChange={(checked) => updateFilters({ showPredictions: checked })}
              />
              <Label className="text-sm">Mostrar Predicciones</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={filters.showComparisons} 
                onCheckedChange={(checked) => updateFilters({ showComparisons: checked })}
              />
              <Label className="text-sm">Mostrar Comparaciones</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={alertsEnabled} 
                onCheckedChange={setAlertsEnabled}
              />
              <Label className="text-sm">Alertas Activas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                <p className="text-2xl font-bold">{analytics?.totalPayments}</p>
                {filters.showComparisons && analytics?.comparisons && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +{analytics.comparisons.previousPeriod.payments - analytics.totalPayments} vs anterior
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold">{analytics ? formatCurrency(analytics.totalAmount) : '$0'}</p>
                {filters.showComparisons && analytics?.comparisons && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {formatPercentage(analytics.comparisons.previousPeriod.growth)}
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics ? Math.round((analytics.paidAmount / analytics.totalAmount) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">
                  {analytics ? formatCurrency(analytics.paidAmount) : '$0'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analytics ? formatCurrency(analytics.pendingAmount) : '$0'}
                </p>
                <p className="text-xs text-gray-500">
                  {analytics ? Math.round((analytics.pendingAmount / analytics.totalAmount) * 100) : 0}% del total
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {analytics ? formatCurrency(analytics.overdueAmount) : '$0'}
                </p>
                <p className="text-xs text-gray-500">
                  {analytics ? Math.round((analytics.overdueAmount / analytics.totalAmount) * 100) : 0}% del total
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automatización</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics ? analytics.efficiency.automationRate.toFixed(1) : '0'}%
                </p>
                <p className="text-xs text-gray-500">
                  Tasa de automatización
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Section */}
      {filters.showPredictions && analytics?.predictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Predicciones y Pronósticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Próximo Mes</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analytics.predictions.nextMonthAmount)}
                </p>
                <p className="text-sm text-blue-700">
                  {formatPercentage(analytics.predictions.nextMonthGrowth)} vs actual
                </p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-orange-900">Score de Riesgo</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.predictions.riskScore.toFixed(1)}/100
                </p>
                <p className="text-sm text-orange-700">
                  {analytics.predictions.riskScore < 30 ? 'Bajo riesgo' : 
                   analytics.predictions.riskScore < 70 ? 'Riesgo moderado' : 'Alto riesgo'}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900">Confianza Promedio</h3>
                <p className="text-2xl font-bold text-green-600">
                  {(analytics.predictions.cashFlowForecast.reduce((acc, item) => acc + item.confidence, 0) / analytics.predictions.cashFlowForecast.length * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-green-700">En predicciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Insights Inteligentes
              </div>
              <Badge variant="secondary">{insights.length} insights</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights
                .sort((a, b) => a.priority - b.priority)
                .map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getPriorityColor(insight.impact)}
                          >
                            {insight.impact === 'high' ? 'Alto' : 
                             insight.impact === 'medium' ? 'Medio' : 'Bajo'} impacto
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {insight.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button variant="outline" size="sm" className="text-xs">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="methods">Métodos</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiencia</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tendencias Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.monthlyTrend.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium w-12">{month.month}</div>
                        <div className="flex items-center gap-2">
                          {month.growth > 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            month.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatPercentage(month.growth)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(month.total)}</div>
                        <div className="text-xs text-gray-500">{month.paid + month.pending + month.overdue} pagos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximos Pagos Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.upcomingPayments
                    .filter(payment => payment.days_until_due <= 7)
                    .map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          payment.priority === 'high' ? 'bg-red-500' :
                          payment.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{payment.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{payment.category}</span>
                            {payment.auto_pay && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {payment.days_until_due === 0 ? 'Hoy' : 
                           payment.days_until_due === 1 ? 'Mañana' : 
                           `${payment.days_until_due} días`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.monthlyTrend.map((month, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{month.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{formatCurrency(month.total)}</span>
                          <Badge variant={month.growth > 0 ? 'default' : 'destructive'}>
                            {formatPercentage(month.growth)}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-green-100 p-2 rounded text-center">
                          <div className="font-medium text-green-800">Pagado</div>
                          <div className="text-green-600">{formatCurrency(month.paid)}</div>
                        </div>
                        <div className="bg-yellow-100 p-2 rounded text-center">
                          <div className="font-medium text-yellow-800">Pendiente</div>
                          <div className="text-yellow-600">{formatCurrency(month.pending)}</div>
                        </div>
                        <div className="bg-red-100 p-2 rounded text-center">
                          <div className="font-medium text-red-800">Vencido</div>
                          <div className="text-red-600">{formatCurrency(month.overdue)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {filters.showPredictions && analytics?.predictions && (
              <Card>
                <CardHeader>
                  <CardTitle>Pronóstico de Flujo de Efectivo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.predictions.cashFlowForecast.map((forecast, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {format(parseISO(forecast.date), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="text-sm text-gray-600">
                            Confianza: {(forecast.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">
                            {formatCurrency(forecast.predicted)}
                          </div>
                          <Progress value={forecast.confidence * 100} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.categoryBreakdown.map((category, index) => (
                    <div key={index} className="space-y-3 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIconComponent(category.icon)}
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={category.trend > 0 ? 'default' : 'destructive'}>
                            {formatPercentage(category.trend)}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Monto: {formatCurrency(category.amount)}</span>
                          <span>{category.count} pagos</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                        <div className="text-xs text-gray-500 text-right">
                          {category.percentage.toFixed(1)}% del total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rendimiento por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.categoryBreakdown
                    .sort((a, b) => b.amount - a.amount)
                    .map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-600">
                            Promedio: {formatCurrency(category.amount / category.count)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-600">{category.count} pagos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.paymentMethods.map((method, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{method.method}</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(method.amount)}</div>
                          <div className="text-sm text-gray-600">{method.count} pagos</div>
                        </div>
                      </div>
                      <Progress value={method.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 text-right">
                        {method.percentage.toFixed(1)}% del total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Distribución Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.geographicData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(region.amount)}</div>
                        <div className="text-sm text-gray-600">{region.count} pagos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Patrones Horarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.timePatterns.hourly.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{hour.hour}:00</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(hour.count / Math.max(...analytics.timePatterns.hourly.map(h => h.count))) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{hour.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Patrones Semanales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.timePatterns.daily.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day.day}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(day.count / Math.max(...analytics.timePatterns.daily.map(d => d.count))) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{day.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Dispositivos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.deviceData.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {device.device === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.device === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.device === 'Tablet' && <Tablet className="h-4 w-4" />}
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <span className="font-semibold">{device.count}</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                      <div className="text-xs text-gray-500 text-right">
                        {device.percentage.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas de Eficiencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tasa de Automatización</span>
                      <span className="font-bold text-purple-600">
                        {analytics?.efficiency.automationRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={analytics?.efficiency.automationRate} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tiempo de Procesamiento</span>
                      <span className="font-bold text-blue-600">
                        {analytics?.efficiency.averageProcessingTime.toFixed(1)}h
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Promedio por transacción</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tasa de Fallos</span>
                      <span className="font-bold text-red-600">
                        {analytics?.efficiency.failureRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={analytics?.efficiency.failureRate} className="h-3" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Costo por Transacción</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(analytics?.efficiency.costPerTransaction || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filters.showComparisons && analytics?.comparisons && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Comparaciones Temporales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">vs Período Anterior</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Monto</span>
                          <div className="flex items-center gap-2">
                            <span>{formatCurrency(analytics.comparisons.previousPeriod.amount)}</span>
                            <Badge variant={analytics.comparisons.previousPeriod.growth > 0 ? 'default' : 'destructive'}>
                              {formatPercentage(analytics.comparisons.previousPeriod.growth)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Pagos</span>
                          <span className="font-medium">{analytics.comparisons.previousPeriod.payments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-3">vs Año Anterior</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Monto</span>
                          <div className="flex items-center gap-2">
                            <span>{formatCurrency(analytics.comparisons.yearOverYear.amount)}</span>
                            <Badge variant={analytics.comparisons.yearOverYear.growth > 0 ? 'default' : 'destructive'}>
                              {formatPercentage(analytics.comparisons.yearOverYear.growth)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Pagos</span>
                          <span className="font-medium">{analytics.comparisons.yearOverYear.payments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}