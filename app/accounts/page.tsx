'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  PiggyBank, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRightLeft,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  Zap,
  Shield,
  Star,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useLoading } from '@/components/providers/loading-provider';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { setLoading } = useLoading();
  const [showForm, setShowForm] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'investment',
    balance: '',
    currency: 'USD',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Delay mínimo para mostrar el loading
      const [response] = await Promise.all([
        fetch('/api/accounts'),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        toast.error('Error al cargar las cuentas');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = accounts
    .filter(account => account.type !== 'credit')
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);

  const totalLiabilities = accounts
    .filter(account => account.type === 'credit')
    .reduce((sum, account) => sum + Math.abs(Math.min(0, account.balance)), 0);

  const netWorth = totalAssets - totalLiabilities;

  const handleAddAccount = () => {
    if (newAccount.name && newAccount.balance) {
      const account: Account = {
        id: Date.now().toString(),
        name: newAccount.name,
        type: newAccount.type,
        balance: parseFloat(newAccount.balance),
        currency: newAccount.currency,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      setAccounts(prev => [...prev, account]);
      setNewAccount({
        name: '',
        type: 'checking',
        balance: '',
        currency: 'USD',
      });
      setShowForm(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-5 w-5" />;
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'credit': return <CreditCard className="h-5 w-5" />;
      case 'investment': return <TrendingUp className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'text-blue-600';
      case 'savings': return 'text-green-600';
      case 'credit': return 'text-red-600';
      case 'investment': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatBalance = (balance: number, show: boolean) => {
    if (!show) return '••••••';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const getAccountTypeLabel = (type: string) => {
    const labels = {
      checking: 'Corriente',
      savings: 'Ahorros',
      credit: 'Crédito',
      investment: 'Inversión'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getAccountProgress = (account: Account) => {
    if (account.type === 'credit') {
      const limit = 5000; // Mock credit limit
      const used = Math.abs(account.balance);
      return (used / limit) * 100;
    }
    return 0;
  };

  const getAccountStatus = (account: Account) => {
    if (account.type === 'credit') {
      const progress = getAccountProgress(account);
      if (progress > 80) return { status: 'danger', text: 'Límite Alto' };
      if (progress > 60) return { status: 'warning', text: 'Precaución' };
      return { status: 'good', text: 'Saludable' };
    }
    if (account.balance < 100) return { status: 'warning', text: 'Saldo Bajo' };
    return { status: 'good', text: 'Activa' };
  };

  const accountStats = {
    total: accounts.length,
    active: accounts.filter(a => a.is_active).length,
    checking: accounts.filter(a => a.type === 'checking').length,
    savings: accounts.filter(a => a.type === 'savings').length,
    credit: accounts.filter(a => a.type === 'credit').length,
    investment: accounts.filter(a => a.type === 'investment').length
  };



  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">Mis Cuentas</h1>
              <p className="text-blue-100 text-lg">
                Gestiona tu patrimonio financiero de manera inteligente
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Tiempo Real</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span>Premium</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 transition-all duration-200 hover:scale-105"
              >
                {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showBalances ? 'Ocultar Saldos' : 'Mostrar Saldos'}
              </Button>
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cuenta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-600" />
                      Agregar Nueva Cuenta
                    </DialogTitle>
                    <DialogDescription>
                      Crea una nueva cuenta bancaria para organizar mejor tus finanzas.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Cuenta</Label>
                      <Input
                        placeholder="Ej: Cuenta Corriente Principal"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Cuenta</Label>
                      <Select
                        value={newAccount.type}
                        onValueChange={(value: 'checking' | 'savings' | 'credit' | 'investment') => 
                          setNewAccount(prev => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">💳 Corriente</SelectItem>
                          <SelectItem value="savings">🏦 Ahorros</SelectItem>
                          <SelectItem value="credit">💸 Tarjeta de Crédito</SelectItem>
                          <SelectItem value="investment">📈 Inversión</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Saldo Actual</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newAccount.balance}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Moneda</Label>
                      <Select
                        value={newAccount.currency}
                        onValueChange={(value) => setNewAccount(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">🇺🇸 USD</SelectItem>
                          <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                          <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                          <SelectItem value="CAD">🇨🇦 CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddAccount} className="flex-1 transition-all duration-200 hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Cuenta
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)} className="transition-all duration-200 hover:scale-105">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-700 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                Activos Totales
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400">En tiempo real</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 dark:bg-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-all duration-300 group-hover:rotate-12">
              <ArrowUpRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
              {formatBalance(totalAssets, showBalances)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Corriente, Ahorros, Inversiones
              </p>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                +{accountStats.checking + accountStats.savings + accountStats.investment}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group bg-gradient-to-br from-red-50 via-pink-50 to-red-100 dark:from-red-950/30 dark:via-pink-950/20 dark:to-red-900/30 border-red-200 dark:border-red-700 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-500 hover:scale-105 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300 group-hover:text-red-800 dark:group-hover:text-red-200 transition-colors">
                Pasivos Totales
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-600 dark:text-red-400">Monitoreado</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 dark:bg-red-400/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all duration-300 group-hover:rotate-12">
              <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
              {formatBalance(totalLiabilities, showBalances)}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-600 dark:text-red-400">
                Tarjetas de Crédito, Préstamos
              </p>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                {accountStats.credit}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className={`group ${netWorth >= 0 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-700 hover:shadow-xl hover:shadow-blue-500/20' 
          : 'bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-orange-950/30 dark:via-red-950/20 dark:to-orange-900/30 border-orange-200 dark:border-orange-700 hover:shadow-xl hover:shadow-orange-500/20'
        } transition-all duration-500 hover:scale-105 cursor-pointer`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className={`text-sm font-medium transition-colors ${
                netWorth >= 0 
                  ? 'text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200' 
                  : 'text-orange-700 dark:text-orange-300 group-hover:text-orange-800 dark:group-hover:text-orange-200'
              }`}>
                Patrimonio Neto
              </CardTitle>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  netWorth >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                }`} />
                <span className={`text-xs ${
                  netWorth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {netWorth >= 0 ? 'Positivo' : 'Requiere atención'}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12 ${
              netWorth >= 0 
                ? 'bg-blue-500/20 dark:bg-blue-400/20 group-hover:bg-blue-500/30' 
                : 'bg-orange-500/20 dark:bg-orange-400/20 group-hover:bg-orange-500/30'
            }`}>
              <TrendingUp className={`h-6 w-6 ${
                netWorth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${
              netWorth >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'
            }`}>
              {formatBalance(netWorth, showBalances)}
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${
                netWorth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
              }`}>
                Activos - Pasivos
              </p>
              <Badge variant={netWorth >= 0 ? 'default' : 'destructive'} className="transition-all duration-200">
                {netWorth >= 0 ? '✓ Saludable' : '⚠ Revisar'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <TabsList className="grid w-full lg:w-auto grid-cols-3 lg:grid-cols-4 bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Cuentas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cuentas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="checking">Corriente</SelectItem>
                <SelectItem value="savings">Ahorros</SelectItem>
                <SelectItem value="credit">Crédito</SelectItem>
                <SelectItem value="investment">Inversión</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3"
            >
              {viewMode === 'grid' ? '☰' : '⊞'}
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Cuentas</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{accountStats.total}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Activas</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{accountStats.active}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-900/30 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Inversiones</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{accountStats.investment}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/30 dark:to-red-900/30 border-orange-200 dark:border-orange-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Crédito</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{accountStats.credit}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No hay cuentas</h3>
                <p className="text-muted-foreground">Comienza agregando tu primera cuenta financiera</p>
              </div>
              <Button onClick={() => setShowForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Cuenta
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
              : 'space-y-4'
            }>
              {filteredAccounts.map((account, index) => {
                const status = getAccountStatus(account);
                const progress = getAccountProgress(account);
                
                return (
                  <Card 
                    key={account.id} 
                    className={`group transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] cursor-pointer animate-in fade-in-50 slide-in-from-bottom-4`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${getAccountColor(account.type)}`}>
                          {getAccountIcon(account.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                            {account.name}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {getAccountTypeLabel(account.type)}
                            </Badge>
                            <Badge 
                              variant={status.status === 'good' ? 'default' : status.status === 'warning' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {status.text}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Transferir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Saldo Actual</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">{account.currency}</span>
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                        <div className={`text-3xl font-bold transition-all duration-300 ${
                          account.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatBalance(Math.abs(account.balance), showBalances)}
                        </div>
                        
                        {account.type === 'credit' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Utilizado</span>
                              <span>{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs">
                          {account.type === 'credit' && (
                            <Badge variant="outline" className="text-red-600 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Saldo pendiente
                            </Badge>
                          )}
                          {account.type === 'savings' && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Generando intereses
                            </Badge>
                          )}
                          {account.type === 'investment' && (
                            <Badge variant="outline" className="text-purple-600 border-purple-200">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Portafolio activo
                            </Badge>
                          )}
                          {account.type === 'checking' && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Activity className="h-3 w-3 mr-1" />
                              Cuenta principal
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 transition-all duration-200 hover:scale-105 hover:bg-blue-50 hover:border-blue-200"
                          onClick={() => window.location.href = `/accounts/${account.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:border-green-200"
                          onClick={() => window.location.href = `/accounts/${account.id}/transfer`}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Transferir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Análisis Financiero</h3>
                <p className="text-sm text-muted-foreground">Análisis detallado de tus finanzas</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/accounts/analysis', '_blank')}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Ver Análisis Completo
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Ingresos del Mes</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">$2,450</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-900/30 border-red-200 dark:border-red-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Gastos del Mes</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">$1,850</p>
                    </div>
                    <div className="w-12 h-12 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center">
                      <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/30 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Ahorro del Mes</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">$600</p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <PiggyBank className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Metas Financieras</h3>
                <p className="text-sm text-muted-foreground">Gestiona y rastrea tus objetivos financieros</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/accounts/goals', '_blank')}
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Ver Metas Completas
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-900/30 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Fondo de Emergencia</p>
                      <p className="text-xl font-bold text-purple-900 dark:text-purple-100">$3,200 / $5,000</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Progress value={64} className="h-2" />
                  <p className="text-xs text-muted-foreground">64% completado</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-100 dark:from-orange-950/30 dark:to-yellow-900/30 border-orange-200 dark:border-orange-700">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Vacaciones</p>
                      <p className="text-xl font-bold text-orange-900 dark:text-orange-100">$1,500 / $3,000</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Progress value={50} className="h-2" />
                  <p className="text-xs text-muted-foreground">50% completado</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}