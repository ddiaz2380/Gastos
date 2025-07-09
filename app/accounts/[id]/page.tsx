'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  account_id: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export default function AccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
      fetchTransactions();
      fetchMonthlyData();
    }
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`);
      if (response.ok) {
        const data = await response.json();
        setAccount(data);
      } else {
        toast.error('Error al cargar los detalles de la cuenta');
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
      toast.error('Error al cargar los detalles de la cuenta');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?account_id=${accountId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(`/api/accounts/${accountId}/monthly-data?period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setMonthlyData(data);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-6 w-6" />;
      case 'savings': return <PiggyBank className="h-6 w-6" />;
      case 'credit': return <CreditCard className="h-6 w-6" />;
      case 'investment': return <TrendingUp className="h-6 w-6" />;
      default: return <Wallet className="h-6 w-6" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'text-blue-600 bg-blue-100';
      case 'savings': return 'text-green-600 bg-green-100';
      case 'credit': return 'text-red-600 bg-red-100';
      case 'investment': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatBalance = (balance: number) => {
    if (!showBalance) return '••••••';
    return `$${Math.abs(balance).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const avgMonthlyIncome = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length 
    : 0;

  const avgMonthlyExpenses = monthlyData.length > 0 
    ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando detalles de la cuenta...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cuenta no encontrada</p>
          <Button onClick={() => router.push('/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cuentas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/accounts')}
            className="transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-muted-foreground">Detalles y análisis de la cuenta</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="transition-all duration-200 hover:scale-105"
          >
            {showBalance ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalance ? 'Ocultar' : 'Mostrar'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="transition-all duration-200 hover:scale-105"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="transition-all duration-200 hover:scale-105"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Account Overview Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/20 border-2 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${getAccountColor(account.type)}`}>
                {getAccountIcon(account.type)}
              </div>
              <div>
                <CardTitle className="text-xl">{account.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {account.type}
                  </Badge>
                  <Badge variant={account.is_active ? 'default' : 'secondary'}>
                    {account.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Saldo Actual</p>
              <div className={`text-3xl font-bold ${
                account.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {account.balance < 0 && account.type === 'credit' ? '-' : ''}
                {formatBalance(account.balance)}
              </div>
              <p className="text-sm text-muted-foreground">{account.currency}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <ArrowUpRight className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Ingresos Totales</p>
              <p className="text-lg font-semibold text-emerald-600">
                {formatBalance(totalIncome)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <ArrowDownLeft className="h-5 w-5 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Gastos Totales</p>
              <p className="text-lg font-semibold text-red-600">
                {formatBalance(totalExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <BarChart3 className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Promedio Mensual</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatBalance(avgMonthlyIncome - avgMonthlyExpenses)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Creada</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatDate(account.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Transacciones
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Transacciones Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay transacciones registradas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? 
                            <Plus className="h-4 w-4" /> : 
                            <Minus className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatBalance(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  {transactions.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">
                        Ver todas las transacciones ({transactions.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Gráfico de distribución próximamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tendencia Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.length === 0 ? (
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No hay datos suficientes</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monthlyData.slice(-6).map((month, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{month.month}</span>
                            <span className="font-medium">
                              {formatBalance(month.income - month.expenses)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Ingresos</span>
                              <span>{formatBalance(month.income)}</span>
                            </div>
                            <Progress 
                              value={(month.income / Math.max(month.income, month.expenses)) * 100} 
                              className="h-2 bg-emerald-100"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Gastos</span>
                              <span>{formatBalance(month.expenses)}</span>
                            </div>
                            <Progress 
                              value={(month.expenses / Math.max(month.income, month.expenses)) * 100} 
                              className="h-2 bg-red-100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de la Cuenta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información General</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Nombre de la cuenta</label>
                      <p className="text-muted-foreground">{account.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo de cuenta</label>
                      <p className="text-muted-foreground capitalize">{account.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Moneda</label>
                      <p className="text-muted-foreground">{account.currency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Estado</label>
                      <p className="text-muted-foreground">
                        {account.is_active ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Acciones</h3>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      Editar Información
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/accounts/${accountId}/transfer`)}
                    >
                      Transferir Fondos
                    </Button>
                    <Button variant="destructive">
                      Desactivar Cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}