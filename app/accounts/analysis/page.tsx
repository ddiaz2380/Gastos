'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  CreditCard,
  PiggyBank,
  Wallet,
  Activity,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Star,
  Zap,
  Shield,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  LineChart,
  Grid3X3,
  List,
  Calculator,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, CurrencyCode } from '@/lib/currency-client';
import { useLoading } from '@/components/providers/loading-provider';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

interface AnalysisData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  monthlyGrowth: number;
  accountsByType: { [key: string]: number };
  monthlyTrends: { month: string; income: number; expenses: number; balance: number }[];
  categoryBreakdown: { category: string; amount: number; percentage: number }[];
  topTransactions: Transaction[];
}

export default function AccountsAnalysisPage() {
  const { setLoading } = useLoading();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('ARS');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(subMonths(new Date(), 2)),
    end: endOfMonth(new Date())
  });

  useEffect(() => {
    fetchData();
  }, [selectedPeriod, selectedCurrency]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch accounts
      const accountsResponse = await fetch('/api/accounts');
      const accountsData = await accountsResponse.json();
      
      // Fetch transactions
      const transactionsResponse = await fetch('/api/transactions');
      const transactionsData = await transactionsResponse.json();
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
      
      // Calculate analysis data
      calculateAnalysis(accountsData, transactionsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos de análisis');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalysis = (accounts: Account[], transactions: Transaction[]) => {
    const now = new Date();
    const periodStart = getPeriodStart(selectedPeriod);
    
    // Filter transactions by period
    const periodTransactions = transactions.filter(tx => 
      new Date(tx.date) >= periodStart && new Date(tx.date) <= now
    );
    
    // Calculate totals
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = periodTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExpenses = periodTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const netFlow = totalIncome - totalExpenses;
    
    // Calculate monthly growth
    const lastMonth = subMonths(now, 1);
    const lastMonthTransactions = transactions.filter(tx => 
      new Date(tx.date) >= lastMonth && new Date(tx.date) < now
    );
    const lastMonthFlow = lastMonthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0) - 
      lastMonthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const monthlyGrowth = lastMonthFlow === 0 ? 0 : ((netFlow - lastMonthFlow) / Math.abs(lastMonthFlow)) * 100;
    
    // Accounts by type
    const accountsByType = accounts.reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + account.balance;
      return acc;
    }, {} as { [key: string]: number });
    
    // Monthly trends
    const monthlyTrends = getMonthlyTrends(transactions, selectedPeriod);
    
    // Category breakdown
    const categoryBreakdown = getCategoryBreakdown(periodTransactions);
    
    // Top transactions
    const topTransactions = periodTransactions
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 10);
    
    setAnalysisData({
      totalBalance,
      totalIncome,
      totalExpenses,
      netFlow,
      monthlyGrowth,
      accountsByType,
      monthlyTrends,
      categoryBreakdown,
      topTransactions
    });
  };

  const getPeriodStart = (period: '1m' | '3m' | '6m' | '1y') => {
    const now = new Date();
    switch (period) {
      case '1m': return subMonths(now, 1);
      case '3m': return subMonths(now, 3);
      case '6m': return subMonths(now, 6);
      case '1y': return subMonths(now, 12);
      default: return subMonths(now, 3);
    }
  };

  const getMonthlyTrends = (transactions: Transaction[], period: '1m' | '3m' | '6m' | '1y') => {
    const months = period === '1m' ? 1 : period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const trends = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenses = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      trends.push({
        month: format(monthStart, 'MMM yyyy', { locale: es }),
        income,
        expenses,
        balance: income - expenses
      });
    }
    
    return trends;
  };

  const getCategoryBreakdown = (transactions: Transaction[]) => {
    const categoryTotals = transactions.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {} as { [key: string]: number });
    
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking': return Wallet;
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return TrendingUp;
      default: return Building2;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'checking': return 'from-blue-500 to-cyan-600';
      case 'savings': return 'from-green-500 to-emerald-600';
      case 'credit': return 'from-red-500 to-rose-600';
      case 'investment': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'checking': return 'Cuenta Corriente';
      case 'savings': return 'Caja de Ahorro';
      case 'credit': return 'Tarjeta de Crédito';
      case 'investment': return 'Inversión';
      default: return 'Otro';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Análisis de Cuentas
            </h1>
            <p className="text-lg text-muted-foreground">
              Análisis detallado de tus cuentas y transacciones financieras
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
              <SelectTrigger className="w-[150px] bg-white dark:bg-gray-800">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Último mes</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="1y">Último año</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCurrency} onValueChange={(value: any) => setSelectedCurrency(value)}>
              <SelectTrigger className="w-[120px] bg-white dark:bg-gray-800">
                <DollarSign className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-white dark:bg-gray-800">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={fetchData} className="bg-gradient-to-r from-primary to-blue-600">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        {analysisData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Balance Total
                  </CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(analysisData.totalBalance, selectedCurrency)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <span>Todas las cuentas</span>
                    <Activity className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                    Ingresos
                  </CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(analysisData.totalIncome, selectedCurrency)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                    <span>Período seleccionado</span>
                    <TrendingUp className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                    Gastos
                  </CardTitle>
                  <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                    <ArrowDownLeft className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatCurrency(analysisData.totalExpenses, selectedCurrency)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                    <span>Período seleccionado</span>
                    <TrendingDown className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 bg-gradient-to-br ${
              analysisData.netFlow >= 0 
                ? 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' 
                : 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm font-medium ${
                    analysisData.netFlow >= 0 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    Flujo Neto
                  </CardTitle>
                  <div className={`p-2 rounded-full ${
                    analysisData.netFlow >= 0 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    {analysisData.netFlow >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${
                    analysisData.netFlow >= 0 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {formatCurrency(analysisData.netFlow, selectedCurrency)}
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    analysisData.netFlow >= 0 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    <span>Ingresos - Gastos</span>
                    <Calculator className="h-3 w-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex bg-white dark:bg-gray-800 shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Categorías
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Por Cuenta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cuentas por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData && Object.entries(analysisData.accountsByType).map(([type, balance]) => {
                      const Icon = getAccountTypeIcon(type);
                      const percentage = (Math.abs(balance) / Object.values(analysisData.accountsByType).reduce((sum, b) => sum + Math.abs(b), 0)) * 100;
                      
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${getAccountTypeColor(type)} text-white`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{getAccountTypeName(type)}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{formatCurrency(balance, selectedCurrency)}</div>
                              <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento Mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData && (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          analysisData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analysisData.monthlyGrowth >= 0 ? '+' : ''}{analysisData.monthlyGrowth.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Cambio mensual</p>
                      </div>
                    )}
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Tendencia:</span>
                        <span className={`font-medium ${
                          analysisData && analysisData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analysisData && analysisData.monthlyGrowth >= 0 ? 'Positiva' : 'Negativa'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Período:</span>
                        <span className="font-medium">{selectedPeriod.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Moneda:</span>
                        <span className="font-medium">{selectedCurrency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData && analysisData.monthlyTrends.map((trend, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{trend.month}</h4>
                        <div className={`font-bold ${
                          trend.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(trend.balance, selectedCurrency)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Ingresos:</span>
                          <span>{formatCurrency(trend.income, selectedCurrency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Gastos:</span>
                          <span>{formatCurrency(trend.expenses, selectedCurrency)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData && analysisData.categoryBreakdown.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category.category}</span>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(category.amount, selectedCurrency)}</div>
                          <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => {
                const Icon = getAccountTypeIcon(account.type);
                const isNegative = account.balance < 0;
                
                return (
                  <Card key={account.id} className={`border-0 ${
                    isNegative 
                      ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
                      : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getAccountTypeColor(account.type)} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{getAccountTypeName(account.type)}</p>
                          </div>
                        </div>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className={`text-2xl font-bold ${
                          isNegative ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(account.balance, account.currency as CurrencyCode)}
                        </div>
                        {account.description && (
                          <p className="text-sm text-muted-foreground">{account.description}</p>
                        )}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Última actualización:</span>
                          <span>{format(new Date(account.updated_at), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
