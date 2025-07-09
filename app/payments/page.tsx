'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Edit, 
  MoreVertical, 
  Trash2, 
  Eye,
  Receipt,
  CreditCard,
  Home,
  Car,
  Smartphone,
  Zap,
  ShoppingCart,
  Gamepad2,
  Briefcase,
  Heart,
  Grid3X3,
  List,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertCircle,
  Users,
  Building,
  Repeat,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { formatCurrency, CurrencyCode } from '@/lib/currency-client';
import { useLoading } from '@/components/providers/loading-provider';

interface Payment {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: string;
  description?: string;
  account_id?: string;
  currency: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  created_at: string;
  updated_at: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const { setLoading } = useLoading();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments');
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        toast.error('Error al cargar los pagos');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || payment.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'utilities': Home,
      'transport': Car,
      'food': ShoppingCart,
      'entertainment': Gamepad2,
      'health': Heart,
      'education': Briefcase,
      'technology': Smartphone,
      'subscription': Receipt,
      'insurance': Building,
      'other': DollarSign
    };
    return icons[category] || DollarSign;
  };

  // Obtener colores de categoría
  const getCategoryColors = (category: string) => {
    const colors: { [key: string]: string } = {
      'utilities': 'from-blue-500 to-indigo-600',
      'transport': 'from-green-500 to-emerald-600',
      'food': 'from-orange-500 to-yellow-600',
      'entertainment': 'from-indigo-500 to-purple-600',
      'health': 'from-red-500 to-rose-600',
      'education': 'from-teal-500 to-cyan-600',
      'technology': 'from-gray-500 to-slate-600',
      'subscription': 'from-orange-500 to-red-600',
      'insurance': 'from-blue-500 to-indigo-600',
      'other': 'from-gray-500 to-gray-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Calcular estadísticas
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPayments = payments.length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  const recurringPayments = payments.filter(p => p.is_recurring).length;

  // Calcular pagos próximos (próximos 7 días)
  const upcomingPayments = payments.filter(payment => {
    const dueDate = new Date(payment.due_date);
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return payment.status === 'pending' && isAfter(dueDate, today) && isBefore(dueDate, nextWeek);
  });

  // Calcular pagos del mes
  const monthlyPayments = payments.filter(payment => {
    const dueDate = new Date(payment.due_date);
    const today = new Date();
    return dueDate >= startOfMonth(today) && dueDate <= endOfMonth(today);
  });

  // Funciones de acción
  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'paid' }),
      });
      
      if (response.ok) {
        toast.success('Pago marcado como pagado');
        fetchPayments();
      } else {
        toast.error('Error al actualizar el pago');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error al actualizar el pago');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Pago eliminado');
        fetchPayments();
      } else {
        toast.error('Error al eliminar el pago');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error('Error al eliminar el pago');
    }
  };

  const handleCreatePayment = () => {
    router.push('/payments/new');
  };

  const handleViewPayment = (paymentId: string) => {
    router.push(`/payments/${paymentId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const isPaymentOverdue = (payment: Payment) => {
    const dueDate = new Date(payment.due_date);
    const today = new Date();
    return payment.status === 'pending' && isBefore(dueDate, today);
  };

  // Loading is handled by the global loading provider

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Receipt className="h-8 w-8 text-green-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Pagos y Facturas</h1>
                  <p className="text-emerald-100 text-lg">
                    Gestiona tus pagos programados y mantén todo al día
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium">{pendingPayments} Pagos Pendientes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium">{payments.filter(p => p.status === 'paid').length} Pagados este Mes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <Repeat className="h-4 w-4 text-purple-300" />
                  <span className="text-sm font-medium">{recurringPayments} Pagos Recurrentes</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCreatePayment} 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-white/90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Pago
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <BarChart3 className="h-5 w-5 mr-2" />
                Análisis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/30 dark:via-orange-950/30 dark:to-amber-950/30 border-yellow-200 dark:border-yellow-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pagos Pendientes</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Por Pagar</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center">
                <AlertTriangle className="h-2 w-2 text-orange-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">{formatCurrency(totalPending, 'USD')}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
                {pendingPayments} pagos
              </Badge>
              <Badge variant="outline" className="text-xs border-yellow-200 text-yellow-600">
                Próximos
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Pagos Vencidos</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-600 dark:text-red-400">Urgente</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-400 flex items-center justify-center">
                <AlertCircle className="h-2 w-2 text-red-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">{formatCurrency(totalOverdue, 'USD')}</div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                {overduePayments} vencidos
              </Badge>
              <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                Atención
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Pagos Completados</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400">Este Mes</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                <TrendingUp className="h-2 w-2 text-green-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">{formatCurrency(totalPaid, 'USD')}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                {payments.filter(p => p.status === 'paid').length} pagados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Pagos Recurrentes</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 dark:text-blue-400">Automáticos</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <Repeat className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center">
                <Target className="h-2 w-2 text-blue-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{recurringPayments}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Activos
              </Badge>
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                {monthlyPayments.length} este mes
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 lg:grid-cols-3 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Todos los Pagos</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Próximos</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pagos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-64"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Próximos pagos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Próximos Pagos (7 días)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingPayments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay pagos próximos</p>
                ) : (
                  upcomingPayments.slice(0, 5).map((payment) => {
                    const CategoryIcon = getCategoryIcon(payment.category);
                    return (
                      <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColors(payment.category)}`}>
                            <CategoryIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{payment.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.due_date), 'dd MMM yyyy', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(payment.amount, payment.currency as CurrencyCode)}</p>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(payment.status)}
                          >
                            {getStatusText(payment.status)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Distribución por categoría */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Distribución por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(
                  payments.reduce((acc: { [key: string]: number }, payment) => {
                    acc[payment.category] = (acc[payment.category] || 0) + payment.amount;
                    return acc;
                  }, {})
                ).slice(0, 5).map(([category, amount]) => {
                  const CategoryIcon = getCategoryIcon(category);
                  const totalAmount = Object.values(
                    payments.reduce((acc: { [key: string]: number }, payment) => {
                      acc[payment.category] = (acc[payment.category] || 0) + payment.amount;
                      return acc;
                    }, {})
                  ).reduce((sum, val) => sum + val, 0);
                  const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">{category}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(amount, 'USD')}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPayments.map((payment) => {
                const CategoryIcon = getCategoryIcon(payment.category);
                const isOverdue = isPaymentOverdue(payment);
                
                return (
                  <Card key={payment.id} className={`group hover:shadow-lg transition-all duration-300 ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColors(payment.category)}`}>
                            <CategoryIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold">{payment.name}</CardTitle>
                            <p className="text-sm text-muted-foreground capitalize">{payment.category}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPayment(payment.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(payment.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Marcar como Pagado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeletePayment(payment.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{formatCurrency(payment.amount, payment.currency as CurrencyCode)}</span>
                        <Badge
                          variant="secondary"
                          className={getStatusColor(payment.status)}
                        >
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Vencimiento:</span>
                        <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                          {format(new Date(payment.due_date), 'dd MMM yyyy', { locale: es })}
                        </span>
                      </div>
                      {payment.is_recurring && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Repeat className="h-4 w-4" />
                          <span>Pago recurrente</span>
                        </div>
                      )}
                      {payment.description && (
                        <p className="text-sm text-muted-foreground">{payment.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-medium">Pago</th>
                        <th className="text-left p-4 font-medium">Categoría</th>
                        <th className="text-left p-4 font-medium">Monto</th>
                        <th className="text-left p-4 font-medium">Vencimiento</th>
                        <th className="text-left p-4 font-medium">Estado</th>
                        <th className="text-left p-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => {
                        const CategoryIcon = getCategoryIcon(payment.category);
                        const isOverdue = isPaymentOverdue(payment);
                        
                        return (
                          <tr key={payment.id} className={`border-b hover:bg-muted/25 transition-colors ${isOverdue ? 'bg-red-50 dark:bg-red-950/10' : ''}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-gradient-to-r ${getCategoryColors(payment.category)}`}>
                                  <CategoryIcon className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{payment.name}</p>
                                  {payment.is_recurring && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                      <Repeat className="h-3 w-3" />
                                      <span>Recurrente</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="capitalize text-muted-foreground">{payment.category}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold">{formatCurrency(payment.amount, payment.currency as CurrencyCode)}</span>
                            </td>
                            <td className="p-4">
                              <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                                {format(new Date(payment.due_date), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </td>
                            <td className="p-4">
                              <Badge
                                variant="secondary"
                                className={getStatusColor(payment.status)}
                              >
                                {getStatusText(payment.status)}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewPayment(payment.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkAsPaid(payment.id)}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Marcar como Pagado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeletePayment(payment.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Pagos Próximos (Próximos 30 días)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPayments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No hay pagos próximos</p>
                  <p className="text-muted-foreground">Todos tus pagos están al día</p>
                </div>
              ) : (
                upcomingPayments.map((payment) => {
                  const CategoryIcon = getCategoryIcon(payment.category);
                  const daysUntilDue = Math.ceil((new Date(payment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${getCategoryColors(payment.category)}`}>
                          <CategoryIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{payment.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{payment.category}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {daysUntilDue === 1 ? 'Mañana' : `En ${daysUntilDue} días`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(payment.amount, payment.currency as CurrencyCode)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.due_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleMarkAsPaid(payment.id)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleViewPayment(payment.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
