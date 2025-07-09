'use client';

import { useState, useEffect, useRef } from 'react';
import { usePageLoading } from '@/hooks/use-page-loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { ExportDialog } from '@/components/transactions/export-dialog';
import { ImportDialog } from '@/components/transactions/import-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Download,
  Upload,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MoreVertical,
  Star,
  Clock,
  Tag,
  CreditCard,
  Wallet,
  PieChart,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLoading } from '@/components/providers/loading-provider';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account_name: string;
  date: string;
  tags?: string[];
  recurring?: boolean;
}

interface CategoryStats {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export default function TransactionsPage() {
  const { setLoading } = useLoading();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Remover el usePageLoading para evitar conflictos con el loading global

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    setIsLoading(true);
    setLoading(true);
    
    try {
      // Cargar datos en paralelo
      await Promise.all([
        fetchTransactions(),
        fetchCategories()
      ]);
      
      // Simular tiempo mínimo para mostrar loading (UX)
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error loading page data:', error);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getFilteredTransactions = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    return transactions.filter(transaction => {
      if (!transaction) return false;
      
      const matchesSearch = !searchTerm || 
        transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all' && transaction.date) {
        try {
          const transactionDate = new Date(transaction.date);
          const now = new Date();
          
          switch (dateFilter) {
            case 'thisMonth':
              matchesDate = isWithinInterval(transactionDate, {
                start: startOfMonth(now),
                end: endOfMonth(now)
              });
              break;
            case 'lastMonth':
              const lastMonth = subMonths(now, 1);
              matchesDate = isWithinInterval(transactionDate, {
                start: startOfMonth(lastMonth),
                end: endOfMonth(lastMonth)
              });
              break;
            case 'last3Months':
              matchesDate = isWithinInterval(transactionDate, {
                start: subMonths(now, 3),
                end: now
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing date:', transaction.date);
          matchesDate = true;
        }
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const handleAddTransaction = () => {
    fetchTransactions();
    setShowForm(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Transacción eliminada exitosamente');
        fetchTransactions();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar la transacción');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Error al eliminar la transacción');
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  const getCategoryStats = (): CategoryStats[] => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    filteredTransactions.forEach(transaction => {
      const existing = categoryMap.get(transaction.category) || { amount: 0, count: 0 };
      categoryMap.set(transaction.category, {
        amount: existing.amount + transaction.amount,
        count: existing.count + 1
      });
    });

    const totalAmount = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const categoryStats = getCategoryStats();

  const getTransactionIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      'Alimentación': '🍽️',
      'Transporte': '🚗',
      'Entretenimiento': '🎬',
      'Salud': '🏥',
      'Educación': '📚',
      'Compras': '🛍️',
      'Servicios': '⚡',
      'Salario': '💼',
      'Freelance': '💻',
      'Inversiones': '📈',
      'Otros': '📦'
    };
    return iconMap[category] || '💰';
  };

  return (
    <div className="space-y-8 p-6">
      {/* Mostrar loading mientras carga */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-lg text-muted-foreground">Cargando transacciones...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight flex items-center gap-3">
                <Activity className="h-10 w-10 animate-pulse" />
                Transacciones
              </h1>
              <p className="text-blue-100 text-lg">
                Gestiona y analiza tus movimientos financieros
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">{filteredTransactions.length} transacciones</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Balance: ${netIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="h-5 w-5 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                onClick={() => setShowImportDialog(true)}
              >
                <Upload className="h-5 w-5 mr-2" />
                Importar
              </Button>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nueva Transacción
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Transacción</DialogTitle>
                    <DialogDescription>
                      Completa los detalles para registrar una nueva transacción en tu cuenta.
                    </DialogDescription>
                  </DialogHeader>
                  <TransactionForm
                    onSubmit={handleAddTransaction}
                    onCancel={() => setShowForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
            <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              ${totalIncome.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12.5% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos Totales</CardTitle>
            <div className="p-2 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-1">
              ${totalExpenses.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-red-600">
              <ArrowDownLeft className="h-3 w-3 mr-1" />
              <span>-8.2% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance Neto</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold mb-1 ${
              netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              ${netIncome.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-blue-600">
              <Activity className="h-3 w-3 mr-1" />
              <span>{netIncome >= 0 ? 'Superávit' : 'Déficit'}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 h-32">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
            <div className="p-2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {filteredTransactions.length}
            </div>
            <div className="flex items-center text-xs text-purple-600">
              <Clock className="h-3 w-3 mr-1" />
              <span>Este período</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card className="border-2 bg-background shadow-lg border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros Avanzados
            <Badge variant="secondary" className="ml-auto">
              {filteredTransactions.length} resultados
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  <SelectItem value="income">💰 Ingresos</SelectItem>
                  <SelectItem value="expense">💸 Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las Categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Categorías</SelectItem>
                  {Array.from(new Set(transactions.map(t => t.category))).map((category, index) => (
                    <SelectItem key={`category-${index}-${category}`} value={category}>
                      {getTransactionIcon(category)} {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="thisMonth">📅 Este mes</SelectItem>
                  <SelectItem value="lastMonth">📆 Mes anterior</SelectItem>
                  <SelectItem value="last3Months">📊 Últimos 3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Vista</label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  Grid
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span>Filtros activos:</span>
              {searchTerm && <Badge variant="outline">Búsqueda: "{searchTerm}"</Badge>}
              {typeFilter !== 'all' && <Badge variant="outline">Tipo: {typeFilter === 'income' ? 'Ingresos' : 'Gastos'}</Badge>}
              {categoryFilter !== 'all' && <Badge variant="outline">Categoría: {categoryFilter}</Badge>}
              {dateFilter !== 'all' && <Badge variant="outline">Período: {dateFilter}</Badge>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setTypeFilter('all');
                setDateFilter('all');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Tabs & Analytics */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorías
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">

          {/* Transactions Display */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Transacciones ({filteredTransactions.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {filteredTransactions.filter(t => t.type === 'income').length} ingresos
                  </Badge>
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    {filteredTransactions.filter(t => t.type === 'expense').length} gastos
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No se encontraron transacciones</h3>
                  <p className="text-muted-foreground mb-4">
                    No hay transacciones que coincidan con tus criterios de búsqueda.
                  </p>
                  <Button onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setTypeFilter('all');
                    setDateFilter('all');
                  }}>
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className={`h-full scrollable-content overflow-y-auto ${viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-2' : 'space-y-3 p-2'}`}>
                  {filteredTransactions.map((transaction, index) => (
                    <div
                      key={`transaction-${transaction.id}-${index}`}
                      className={`group relative rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 ${
                        viewMode === 'grid' ? 'p-4 h-48 flex flex-col' : 'p-4 min-h-[120px] flex items-center'
                      }`}
                    >
                      <div className={`flex ${viewMode === 'grid' ? 'flex-col h-full' : 'items-center justify-between w-full'}`}>
                        <div className={`flex ${viewMode === 'grid' ? 'items-center gap-3 mb-3' : 'items-center gap-4 flex-1'}`}>
                          <div className={`p-3 rounded-full text-2xl flex-shrink-0 ${
                            transaction.type === 'income' 
                              ? 'bg-emerald-100 dark:bg-emerald-900' 
                              : 'bg-red-100 dark:bg-red-900'
                          }`}>
                            {getTransactionIcon(transaction.category)}
                          </div>
                          <div className={`${viewMode === 'grid' ? 'flex-1' : 'flex-1 min-w-0'}`}>
                            <h4 className={`font-semibold ${viewMode === 'grid' ? 'text-base mb-1' : 'text-lg'} truncate`}>
                              {transaction.description}
                            </h4>
                            <div className={`flex items-center gap-2 ${viewMode === 'grid' ? 'mb-2' : 'mt-1'} flex-wrap`}>
                              <Badge variant="secondary" className="text-xs">
                                {transaction.category}
                              </Badge>
                              {transaction.account_name && (
                                <Badge variant="outline" className="text-xs">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {transaction.account_name}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: es })}
                              </Badge>
                              {transaction.recurring && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Recurrente
                                </Badge>
                              )}
                            </div>
                            {transaction.tags && transaction.tags.length > 0 && (
                              <div className={`flex gap-1 ${viewMode === 'grid' ? 'mt-1' : 'mt-2'} flex-wrap`}>
                                {transaction.tags.slice(0, viewMode === 'grid' ? 2 : 4).map((tag, tagIndex) => (
                                  <Badge key={`${transaction.id}-tag-${tagIndex}`} variant="outline" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {viewMode === 'grid' && transaction.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{transaction.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 ${viewMode === 'grid' ? 'mt-auto pt-3 border-t' : ''}`}>
                          <div className={`text-right ${viewMode === 'grid' ? 'flex-1' : ''}`}>
                            <p className={`${viewMode === 'grid' ? 'text-lg' : 'text-xl'} font-bold ${
                              transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTransaction(transaction)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="h-4 w-4 mr-2" />
                                Marcar favorito
                              </DropdownMenuItem>
                              <Separator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTransaction(transaction.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Categorías
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80 scrollable-content overflow-y-auto">
                <div className="space-y-4">
                  {categoryStats.map((stat, index) => (
                    <div key={stat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTransactionIcon(stat.category)}</span>
                          <span className="font-medium">{stat.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${stat.amount.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{stat.count} transacciones</p>
                        </div>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{stat.percentage.toFixed(1)}% del total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Resumen del Período
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">
                        {filteredTransactions.filter(t => t.type === 'income').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Ingresos</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {filteredTransactions.filter(t => t.type === 'expense').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Gastos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Promedio por transacción</span>
                      <span className="font-semibold">
                        ${filteredTransactions.length > 0 
                          ? ((totalIncome + totalExpenses) / filteredTransactions.length).toLocaleString()
                          : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transacción más alta</span>
                      <span className="font-semibold">
                        ${filteredTransactions.length > 0 
                          ? Math.max(...filteredTransactions.map(t => t.amount)).toLocaleString()
                          : '0'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Categorías activas</span>
                      <span className="font-semibold">
                        {new Set(filteredTransactions.map(t => t.category)).size}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((stat) => (
              <Card key={stat.category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTransactionIcon(stat.category)}</div>
                      <CardTitle className="text-lg">{stat.category}</CardTitle>
                    </div>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-2xl font-bold">${stat.amount.toLocaleString()}</div>
                    <Progress value={stat.percentage} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{stat.percentage.toFixed(1)}% del total</span>
                      <span>{stat.count} transacciones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="text-2xl">{getTransactionIcon(selectedTransaction.category)}</div>
                {selectedTransaction.description}
              </DialogTitle>
              <DialogDescription>
                Detalles completos de la transacción
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant={selectedTransaction.type === 'income' ? 'default' : 'destructive'}>
                    {selectedTransaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Monto</label>
                  <p className={`text-2xl font-bold ${
                    selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                  <p className="font-medium">{selectedTransaction.category}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Cuenta</label>
                  <p className="font-medium">{selectedTransaction.account_name || 'No especificada'}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Fecha</label>
                  <p className="font-medium">
                    {format(new Date(selectedTransaction.date), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Recurrente</label>
                  <Badge variant={selectedTransaction.recurring ? 'default' : 'secondary'}>
                    {selectedTransaction.recurring ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
              {selectedTransaction.tags && selectedTransaction.tags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Etiquetas</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedTransaction.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Download className="h-6 w-6 text-primary" />
              Exportar Transacciones
            </DialogTitle>
            <DialogDescription>
              Configura las opciones de exportación para descargar tus transacciones
            </DialogDescription>
          </DialogHeader>
          <ExportDialog 
            transactions={filteredTransactions} 
            onClose={() => setShowExportDialog(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Upload className="h-6 w-6 text-primary" />
              Importar Transacciones
            </DialogTitle>
            <DialogDescription>
              Importa transacciones desde un archivo CSV, Excel o JSON
            </DialogDescription>
          </DialogHeader>
          <ImportDialog 
            onImportComplete={() => {
              fetchTransactions();
              setShowImportDialog(false);
            }}
            onClose={() => setShowImportDialog(false)} 
          />
        </DialogContent>
      </Dialog>

        </>
      )}
    </div>
  );
}