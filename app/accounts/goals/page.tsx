'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flag,
  BarChart3,
  LineChart,
  Activity,
  Zap,
  Gift,
  Home,
  Car,
  GraduationCap,
  Plane,
  Heart,
  Briefcase,
  Smartphone,
  Coffee,
  Grid3X3,
  List,
  Filter,
  Search,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  Calculator,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency, CurrencyCode } from '@/lib/currency-client';
import { useLoading } from '@/components/providers/loading-provider';
import { cn } from '@/lib/utils';

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

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account_id?: string;
}

interface NewGoal {
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: Date | undefined;
  category: string;
  priority: 'high' | 'medium' | 'low';
  accountId: string;
  currency: CurrencyCode;
}

export default function AccountsGoalsPage() {
  const { setLoading } = useLoading();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newGoal, setNewGoal] = useState<NewGoal>({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: undefined,
    category: '',
    priority: 'medium',
    accountId: '',
    currency: 'ARS'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch accounts
      const accountsResponse = await fetch('/api/accounts');
      const accountsData = await accountsResponse.json();
      
      // Fetch goals
      const goalsResponse = await fetch('/api/goals');
      const goalsData = await goalsResponse.json();
      
      setAccounts(accountsData);
      setGoals(goalsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar metas
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'emergency': PiggyBank,
      'travel': Plane,
      'home': Home,
      'education': GraduationCap,
      'investment': TrendingUp,
      'car': Car,
      'health': Heart,
      'technology': Smartphone,
      'business': Briefcase,
      'entertainment': Coffee,
      'gift': Gift,
      'other': Target,
    };
    return icons[category] || Target;
  };

  // Obtener color de categoría
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'emergency': 'from-red-500 to-rose-600',
      'travel': 'from-blue-500 to-cyan-600',
      'home': 'from-green-500 to-emerald-600',
      'education': 'from-purple-500 to-indigo-600',
      'investment': 'from-yellow-500 to-orange-600',
      'car': 'from-gray-500 to-slate-600',
      'health': 'from-pink-500 to-rose-600',
      'technology': 'from-indigo-500 to-blue-600',
      'business': 'from-teal-500 to-cyan-600',
      'entertainment': 'from-orange-500 to-red-600',
      'gift': 'from-purple-500 to-pink-600',
      'other': 'from-gray-500 to-gray-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  // Obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-800 border-red-300',
      'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'low': 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Obtener estado de la meta
  const getGoalStatus = (goal: Goal) => {
    const isCompleted = goal.current_amount >= goal.target_amount;
    const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
    
    if (isCompleted) {
      return { label: 'Completada', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (daysLeft < 0) {
      return { label: 'Vencida', color: 'bg-red-100 text-red-800 border-red-300' };
    } else if (daysLeft <= 30) {
      return { label: 'Próximo a vencer', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    } else {
      return { label: 'En progreso', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
  };

  // Calcular estadísticas
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;
  const activeGoals = goals.filter(g => g.status === 'active' && g.current_amount < g.target_amount).length;
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSavedAmount = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const averageProgress = totalGoals > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

  // Funciones de acción
  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.category || !newGoal.targetDate || !newGoal.accountId) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const goalData = {
        title: newGoal.title,
        description: newGoal.description,
        target_amount: parseFloat(newGoal.targetAmount),
        current_amount: parseFloat(newGoal.currentAmount) || 0,
        target_date: newGoal.targetDate.toISOString().split('T')[0],
        category: newGoal.category,
        priority: newGoal.priority,
        currency: newGoal.currency,
        account_id: newGoal.accountId,
        status: 'active',
        is_active: true
      };

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });

      if (response.ok) {
        toast.success('Meta creada exitosamente');
        setShowCreateModal(false);
        setNewGoal({
          title: '',
          description: '',
          targetAmount: '',
          currentAmount: '0',
          targetDate: undefined,
          category: '',
          priority: 'medium',
          accountId: '',
          currency: 'ARS'
        });
        fetchData();
      } else {
        toast.error('Error al crear la meta');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Error al crear la meta');
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Meta eliminada exitosamente');
        fetchData();
      } else {
        toast.error('Error al eliminar la meta');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Error al eliminar la meta');
    }
  };

  const handleUpdateProgress = async (goalId: string, amount: number) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ current_amount: amount }),
      });
      
      if (response.ok) {
        toast.success('Progreso actualizado exitosamente');
        fetchData();
      } else {
        toast.error('Error al actualizar el progreso');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Error al actualizar el progreso');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Metas de Ahorro
            </h1>
            <p className="text-lg text-muted-foreground">
              Establece y alcanza tus objetivos financieros vinculados a tus cuentas
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análisis
            </Button>
            <Button variant="outline" className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Meta
            </Button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Total de Metas
                </CardTitle>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {totalGoals}
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <span>{activeGoals} activas</span>
                  <Activity className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
                  Completadas
                </CardTitle>
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {completedGoals}
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <span>{totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0}% del total</span>
                  <Trophy className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Meta Total
                </CardTitle>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                  <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(totalTargetAmount, 'ARS')}
                </div>
                <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <span>Objetivo global</span>
                  <Flag className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Progreso Promedio
                </CardTitle>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {averageProgress.toFixed(1)}%
                </div>
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <span>{formatCurrency(totalSavedAmount, 'ARS')} ahorrado</span>
                  <Coins className="h-3 w-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:flex bg-white dark:bg-gray-800 shadow-sm rounded-lg p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Target className="h-4 w-4" />
              Todas las Metas
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
              <LineChart className="h-4 w-4" />
              Progreso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Metas Próximas a Completar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals
                      .filter(goal => {
                        const progress = (goal.current_amount / goal.target_amount) * 100;
                        return progress >= 70 && progress < 100 && goal.status === 'active';
                      })
                      .slice(0, 5)
                      .map((goal) => {
                        const progress = (goal.current_amount / goal.target_amount) * 100;
                        const CategoryIcon = getCategoryIcon(goal.category);
                        const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
                        
                        return (
                          <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(goal.category)} text-white`}>
                                <CategoryIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {daysLeft > 0 ? `${daysLeft} días restantes` : 'Vencida'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Progress value={progress} className="w-24 h-2" />
                                  <span className="text-xs text-muted-foreground">{progress.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{formatCurrency(goal.current_amount, goal.currency as CurrencyCode)}</p>
                              <p className="text-sm text-muted-foreground">
                                de {formatCurrency(goal.target_amount, goal.currency as CurrencyCode)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    {goals.filter(goal => {
                      const progress = (goal.current_amount / goal.target_amount) * 100;
                      return progress >= 70 && progress < 100 && goal.status === 'active';
                    }).length === 0 && (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay metas próximas a completar</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['emergency', 'travel', 'home', 'education', 'investment', 'other'].map(category => {
                      const categoryGoals = goals.filter(g => g.category === category);
                      const totalAmount = categoryGoals.reduce((sum, g) => sum + g.target_amount, 0);
                      const savedAmount = categoryGoals.reduce((sum, g) => sum + g.current_amount, 0);
                      const percentage = totalAmount > 0 ? (savedAmount / totalAmount) * 100 : 0;
                      
                      if (categoryGoals.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span className="font-medium">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{categoryGoals.length} metas</span>
                            <span>{formatCurrency(savedAmount, 'ARS')} / {formatCurrency(totalAmount, 'ARS')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar metas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="emergency">Emergencia</SelectItem>
                  <SelectItem value="travel">Viajes</SelectItem>
                  <SelectItem value="home">Casa</SelectItem>
                  <SelectItem value="education">Educación</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de metas */}
            {filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-xl font-medium text-muted-foreground mb-2">
                    No se encontraron metas
                  </p>
                  <p className="text-muted-foreground text-center mb-4">
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' || filterCategory !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Comienza creando tu primera meta de ahorro'
                    }
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Meta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredGoals.map((goal, index) => {
                  const CategoryIcon = getCategoryIcon(goal.category);
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  const isCompleted = progress >= 100;
                  const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
                  const status = getGoalStatus(goal);

                  if (viewMode === 'grid') {
                    return (
                      <Card 
                        key={goal.id} 
                        className={`group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer ${
                          isCompleted ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' :
                          'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="relative">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-gradient-to-br ${getCategoryColor(goal.category)} text-white shadow-lg`}>
                                <CategoryIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                                <p className="text-sm text-muted-foreground capitalize">{goal.category}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getPriorityColor(goal.priority)}>
                              {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="relative">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progreso</span>
                                <span className="font-medium">{progress.toFixed(1)}%</span>
                              </div>
                              <Progress value={progress} className="h-3" />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{formatCurrency(goal.current_amount, goal.currency as CurrencyCode)}</span>
                                <span>{formatCurrency(goal.target_amount, goal.currency as CurrencyCode)}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Fecha objetivo:</span>
                              <span className="font-medium">
                                {format(new Date(goal.target_date), 'dd MMM yyyy', { locale: es })}
                              </span>
                            </div>
                            {!isCompleted && (
                              <div className="text-center">
                                <span className={`text-sm ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                                  {daysLeft > 0 ? `${daysLeft} días restantes` : 
                                   daysLeft === 0 ? 'Vence hoy' : 
                                   `${Math.abs(daysLeft)} días vencida`}
                                </span>
                              </div>
                            )}
                            {goal.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              onClick={() => {
                                const newAmount = prompt('Nuevo monto ahorrado:', goal.current_amount.toString());
                                if (newAmount && !isNaN(parseFloat(newAmount))) {
                                  handleUpdateProgress(goal.id, parseFloat(newAmount));
                                }
                              }}
                              className="flex-1"
                            >
                              <Calculator className="h-4 w-4 mr-2" />
                              Actualizar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    return (
                      <Card 
                        key={goal.id} 
                        className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 ${
                          isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20' :
                          'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl bg-gradient-to-br ${getCategoryColor(goal.category)} text-white shadow-lg`}>
                                <CategoryIcon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold">{goal.title}</h3>
                                  <Badge className={getPriorityColor(goal.priority)}>
                                    {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                                  </Badge>
                                  <Badge className={status.color}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                  <span className="capitalize">{goal.category}</span>
                                  <span>•</span>
                                  <span>Vence {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: es })}</span>
                                  {!isCompleted && (
                                    <>
                                      <span>•</span>
                                      <span className={daysLeft < 0 ? 'text-red-600' : daysLeft <= 30 ? 'text-yellow-600' : 'text-muted-foreground'}>
                                        {daysLeft > 0 ? `${daysLeft} días restantes` : 
                                         daysLeft === 0 ? 'Vence hoy' : 
                                         `${Math.abs(daysLeft)} días vencida`}
                                      </span>
                                    </>
                                  )}
                                </p>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progreso: {progress.toFixed(1)}%</span>
                                      <span>{formatCurrency(goal.current_amount, goal.currency as CurrencyCode)} / {formatCurrency(goal.target_amount, goal.currency as CurrencyCode)}</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  const newAmount = prompt('Nuevo monto ahorrado:', goal.current_amount.toString());
                                  if (newAmount && !isNaN(parseFloat(newAmount))) {
                                    handleUpdateProgress(goal.id, parseFloat(newAmount));
                                  }
                                }}
                                className="min-w-[120px]"
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                Actualizar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditGoal(goal)}
                                className="min-w-[100px]"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Progreso General de Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">{averageProgress.toFixed(1)}%</div>
                      <p className="text-sm text-muted-foreground">Progreso promedio</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{completedGoals}</div>
                      <p className="text-sm text-muted-foreground">Metas completadas</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(totalSavedAmount, 'ARS')}</div>
                      <p className="text-sm text-muted-foreground">Total ahorrado</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {goals.map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100;
                      const CategoryIcon = getCategoryIcon(goal.category);
                      
                      return (
                        <div key={goal.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getCategoryColor(goal.category)} text-white`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{goal.title}</h4>
                              <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                              <span>{formatCurrency(goal.current_amount, goal.currency as CurrencyCode)}</span>
                              <span>{formatCurrency(goal.target_amount, goal.currency as CurrencyCode)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para crear nueva meta */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Meta</DialogTitle>
              <DialogDescription>
                Define una nueva meta financiera con objetivos específicos y plazos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título de la meta *</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Vacaciones en Europa"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción opcional de la meta"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Monto objetivo *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentAmount">Monto actual</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={newGoal.currentAmount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Fecha objetivo *</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoal.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.targetDate ? format(newGoal.targetDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.targetDate}
                      onSelect={(date) => {
                        setNewGoal(prev => ({ ...prev, targetDate: date }));
                        setCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergencia</SelectItem>
                      <SelectItem value="travel">Viajes</SelectItem>
                      <SelectItem value="home">Casa</SelectItem>
                      <SelectItem value="education">Educación</SelectItem>
                      <SelectItem value="investment">Inversión</SelectItem>
                      <SelectItem value="car">Automóvil</SelectItem>
                      <SelectItem value="health">Salud</SelectItem>
                      <SelectItem value="technology">Tecnología</SelectItem>
                      <SelectItem value="business">Negocio</SelectItem>
                      <SelectItem value="entertainment">Entretenimiento</SelectItem>
                      <SelectItem value="gift">Regalo</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={newGoal.priority} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="account">Cuenta vinculada *</Label>
                  <Select value={newGoal.accountId} onValueChange={(value) => setNewGoal(prev => ({ ...prev, accountId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.filter(acc => acc.is_active).map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select value={newGoal.currency} onValueChange={(value: any) => setNewGoal(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateGoal}>
                Crear Meta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
