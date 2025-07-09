'use client';

import { useState, useEffect } from 'react';
import { PageLoadingWrapper } from '@/components/ui/page-loading-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Target, Plus, Calendar as CalendarIcon, TrendingUp, DollarSign, 
  Trophy, Zap, Star, Wallet, PiggyBank, Rocket, Gift, Home,
  MoreVertical, Edit, Trash2, TrendingDown, Clock, CheckCircle2,
  Filter, Search, BarChart3, PieChart, LineChart, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLoading } from '@/components/providers/loading-provider';

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
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { setLoading } = useLoading();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [response] = await Promise.all([
        fetch('/api/goals'),
        new Promise(resolve => setTimeout(resolve, 1000)) // Minimum 1 second delay
      ]);
      if (response.ok) {
        const data = await response.json();
        const goalsWithProgress = data.map((goal: any) => ({
          ...goal,
          progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0
        }));
        setGoals(goalsWithProgress);
      } else {
        toast.error('Error al cargar las metas financieras');
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Error al cargar las metas financieras');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar metas
  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    const isCompleted = goal.current_amount >= goal.target_amount;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && isCompleted) ||
                         (filterStatus === 'active' && !isCompleted);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Emergencia': PiggyBank,
      'Viajes': Rocket,
      'Casa': Home,
      'Educación': Trophy,
      'Inversión': TrendingUp,
      'Regalo': Gift,
      'Ahorros': Wallet,
      'General': Target
    };
    return icons[category] || Target;
  };

  // Obtener estado de la meta
  const getGoalStatus = (goal: Goal) => {
    const isCompleted = goal.current_amount >= goal.target_amount;
    const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
    
    if (isCompleted) return { status: 'completed', label: 'Completada', color: 'bg-green-500' };
    if (daysLeft < 0) return { status: 'overdue', label: 'Vencida', color: 'bg-red-500' };
    if (daysLeft <= 30) return { status: 'urgent', label: 'Urgente', color: 'bg-orange-500' };
    return { status: 'active', label: 'Activa', color: 'bg-blue-500' };
  };

  // Estadísticas de metas
  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.current_amount >= g.target_amount).length,
    active: goals.filter(g => g.current_amount < g.target_amount && differenceInDays(new Date(g.target_date), new Date()) >= 0).length,
    overdue: goals.filter(g => g.current_amount < g.target_amount && differenceInDays(new Date(g.target_date), new Date()) < 0).length,
    totalTarget: goals.reduce((sum, g) => sum + g.target_amount, 0),
    totalSaved: goals.reduce((sum, g) => sum + g.current_amount, 0),
    averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + Math.round((g.current_amount / g.target_amount) * 100), 0) / goals.length : 0
  };
  const [showForm, setShowForm] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: new Date(),
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: '',
  });

  const handleAddGoal = async () => {
    if (newGoal.title && newGoal.targetAmount && newGoal.category) {
      const targetAmount = parseFloat(newGoal.targetAmount);
      const currentAmount = parseFloat(newGoal.currentAmount) || 0;
      
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.category,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: (newGoal.deadline || new Date()).toISOString().split('T')[0] as string,
        category: newGoal.category,
        priority: newGoal.priority,
        status: 'active',
        currency: 'USD',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setGoals(prev => [...prev, goal]);
      setNewGoal({
        title: '',
        targetAmount: '',
        currentAmount: '',
        deadline: new Date(),
        priority: 'medium',
        category: '',
      });
      setShowForm(false);
      toast.success('Meta creada exitosamente');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    toast.success('Meta eliminada');
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const addFunds = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current_amount: Math.min(goal.current_amount + amount, goal.target_amount) }
        : goal
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <PageLoadingWrapper 
      loadingMessage="Cargando metas financieras..." 
      minDuration={1600}
      showProgress={true}
    >
      <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Trophy className="h-8 w-8 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Metas Financieras</h1>
                  <p className="text-purple-100 text-lg">
                    Convierte tus sueños en realidad con metas inteligentes
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <Target className="h-4 w-4 text-green-300" />
                  <span className="text-sm font-medium">{goalStats.total} Metas Activas</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4 text-yellow-300" />
                  <span className="text-sm font-medium">{goalStats.completed} Completadas</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium">{goalStats.averageProgress.toFixed(1)}% Progreso Promedio</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Nueva Meta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Meta</DialogTitle>
                    <DialogDescription>
                      Define una meta financiera con un objetivo específico y fecha límite.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Título de la Meta</Label>
                      <Input
                        placeholder="ej., Fondo de Emergencia"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad Objetivo</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cantidad Actual (Opcional)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newGoal.currentAmount}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, currentAmount: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        value={newGoal.category}
                        onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Emergencia">🏥 Emergencia</SelectItem>
                          <SelectItem value="Viajes">✈️ Viajes</SelectItem>
                          <SelectItem value="Casa">🏠 Casa</SelectItem>
                          <SelectItem value="Educación">🎓 Educación</SelectItem>
                          <SelectItem value="Inversión">📈 Inversión</SelectItem>
                          <SelectItem value="Regalo">🎁 Regalo</SelectItem>
                          <SelectItem value="Ahorros">💰 Ahorros</SelectItem>
                          <SelectItem value="General">🎯 General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridad</Label>
                      <Select
                        value={newGoal.priority}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setNewGoal(prev => ({ ...prev, priority: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Límite</Label>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !newGoal.deadline && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newGoal.deadline ? format(newGoal.deadline, 'PPP') : 'Seleccionar fecha'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newGoal.deadline}
                            onSelect={(date) => {
                              setNewGoal(prev => ({ ...prev, deadline: date || new Date() }));
                              setDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddGoal} className="flex-1">
                        Crear Meta
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
    <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Metas</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs text-blue-600 dark:text-blue-400">Activas</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <Star className="h-2 w-2 text-yellow-800" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{goalStats.total}</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {goalStats.active} Activas
          </Badge>
          <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
            {goalStats.overdue} Vencidas
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Objetivo Total</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Meta Global</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
            <TrendingUp className="h-2 w-2 text-green-800" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">${goalStats.totalTarget.toLocaleString()}</div>
        <div className="flex items-center gap-2">
          <Progress value={(goalStats.totalSaved / goalStats.totalTarget) * 100} className="flex-1 h-2" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {((goalStats.totalSaved / goalStats.totalTarget) * 100).toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>

    <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/30 dark:via-violet-950/30 dark:to-fuchsia-950/30 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-fuchsia-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Cantidad Ahorrada</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs text-purple-600 dark:text-purple-400">Progreso</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-400 flex items-center justify-center">
            <Zap className="h-2 w-2 text-pink-800" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">${goalStats.totalSaved.toLocaleString()}</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
            {goalStats.averageProgress.toFixed(1)}% Promedio
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">Metas Completadas</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs text-amber-600 dark:text-amber-400">Logros</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
            <Award className="h-2 w-2 text-yellow-800" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">{goalStats.completed}</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            {goalStats.total > 0 ? ((goalStats.completed / goalStats.total) * 100).toFixed(1) : 0}% Éxito
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>

      {/* Advanced Tabs System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <TabsList className="grid w-full lg:w-auto grid-cols-4 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Análisis</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Logros</span>
            </TabsTrigger>
          </TabsList>

          {activeTab === 'goals' && (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar metas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="completed">Completadas</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <PieChart className="h-4 w-4" /> : <LineChart className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <Target className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No hay metas configuradas</p>
                    <p className="text-muted-foreground">Comienza creando tu primera meta financiera</p>
                  </div>
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Meta
                  </Button>
                </div>
              </div>
            ) : (
              goals.slice(0, 6).map((goal, index) => {
                const percentage = Math.round((goal.current_amount / goal.target_amount) * 100);
                const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
                const isCompleted = goal.current_amount >= goal.target_amount;
                const status = getGoalStatus(goal);
                const CategoryIcon = getCategoryIcon(goal.category);

                return (
                  <Card 
                    key={goal.id} 
                    className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                      isCompleted ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' : 
                      'hover:border-primary/50'
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
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${isCompleted ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-purple-600'} text-white shadow-lg`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{goal.category}</p>
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
                        <Badge variant={getPriorityColor(goal.priority) as any} className="text-xs">
                          {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${status.color} text-white border-0`}>
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">${goal.current_amount.toLocaleString()}</span>
                          <span className="text-muted-foreground">${goal.target_amount.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          <Progress 
                            value={percentage} 
                            className={`h-3 transition-all duration-500 ${isCompleted ? 'bg-green-200' : ''}`}
                          />
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-primary">{percentage.toFixed(1)}% completado</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className={daysLeft < 0 ? 'text-red-500 font-medium' : daysLeft <= 30 ? 'text-orange-500 font-medium' : ''}>
                                {daysLeft > 0 ? `${daysLeft} días` : daysLeft === 0 ? 'Hoy' : 'Vencida'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Restante:</span>
                          <span className="text-sm font-bold">
                            ${Math.max(0, goal.target_amount - goal.current_amount).toLocaleString()}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <Trophy className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">¡Meta Completada!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {filteredGoals.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <Filter className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No se encontraron metas</p>
                    <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setFilterPriority('all');
                    setFilterStatus('all');
                  }}>
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            ) : (
              filteredGoals.map((goal, index) => {
                const percentage = Math.round((goal.current_amount / goal.target_amount) * 100);
                const daysLeft = differenceInDays(new Date(goal.target_date), new Date());
                const isCompleted = goal.current_amount >= goal.target_amount;
                const status = getGoalStatus(goal);
                const CategoryIcon = getCategoryIcon(goal.category);

                if (viewMode === 'list') {
                  return (
                    <Card 
                      key={goal.id} 
                      className={`group transition-all duration-300 hover:shadow-lg ${
                        isCompleted ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' : 
                        'hover:border-primary/50'
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${isCompleted ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-purple-600'} text-white shadow-lg`}>
                              <CategoryIcon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold">{goal.title}</h3>
                                <Badge variant={getPriorityColor(goal.priority) as any} className="text-xs">
                                  {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${status.color} text-white border-0`}>
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{goal.category}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>${goal.current_amount.toLocaleString()}</span>
                                    <span>${goal.target_amount.toLocaleString()}</span>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold">{percentage.toFixed(1)}%</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {daysLeft > 0 ? `${daysLeft} días` : daysLeft === 0 ? 'Hoy' : 'Vencida'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
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
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card 
                    key={goal.id} 
                    className={`group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                      isCompleted ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' : 
                      'hover:border-primary/50'
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
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${isCompleted ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-purple-600'} text-white shadow-lg`}>
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold">{goal.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{goal.category}</p>
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
                        <Badge variant={getPriorityColor(goal.priority) as any} className="text-xs">
                          {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${status.color} text-white border-0`}>
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">${goal.current_amount.toLocaleString()}</span>
                          <span className="text-muted-foreground">${goal.target_amount.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          <Progress 
                            value={percentage} 
                            className={`h-3 transition-all duration-500 ${isCompleted ? 'bg-green-200' : ''}`}
                          />
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-primary">{percentage.toFixed(1)}% completado</span>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span className={daysLeft < 0 ? 'text-red-500 font-medium' : daysLeft <= 30 ? 'text-orange-500 font-medium' : ''}>
                                {daysLeft > 0 ? `${daysLeft} días` : daysLeft === 0 ? 'Hoy' : 'Vencida'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Restante:</span>
                          <span className="text-sm font-bold">
                            ${Math.max(0, goal.target_amount - goal.current_amount).toLocaleString()}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="flex items-center justify-center p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                            <Trophy className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">¡Meta Completada!</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Progreso por Categoría
              </h3>
              <div className="space-y-4">
                {['Emergencia', 'Viajes', 'Casa', 'Educación', 'Inversión', 'Regalo', 'Ahorros', 'General'].map(category => {
                  const categoryGoals = goals.filter(g => g.category === category);
                  const avgProgress = categoryGoals.length > 0 
                    ? categoryGoals.reduce((sum, g) => sum + Math.round((g.current_amount / g.target_amount) * 100), 0) / categoryGoals.length 
                    : 0;
                  
                  if (categoryGoals.length === 0) return null;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span>{avgProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Distribución de Prioridades
              </h3>
              <div className="space-y-4">
                {['high', 'medium', 'low'].map(priority => {
                  const count = goals.filter(g => g.priority === priority).length;
                  const percentage = goals.length > 0 ? (count / goals.length) * 100 : 0;
                  const label = priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja';
                  const color = priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        <span className="text-sm">{label}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Logros y Reconocimientos
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Primera Meta</h4>
                    <p className="text-xs text-muted-foreground">Crear tu primera meta financiera</p>
                  </div>
                </div>
                <Badge variant={goals.length > 0 ? 'default' : 'secondary'} className="w-full justify-center">
                  {goals.length > 0 ? '¡Completado!' : 'Pendiente'}
                </Badge>
              </div>
              
              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Meta Completada</h4>
                    <p className="text-xs text-muted-foreground">Completar tu primera meta</p>
                  </div>
                </div>
                <Badge variant={goalStats.completed > 0 ? 'default' : 'secondary'} className="w-full justify-center">
                  {goalStats.completed > 0 ? '¡Completado!' : 'Pendiente'}
                </Badge>
              </div>
              
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ahorrador Experto</h4>
                    <p className="text-xs text-muted-foreground">Completar 5 metas</p>
                  </div>
                </div>
                <Badge variant={goalStats.completed >= 5 ? 'default' : 'secondary'} className="w-full justify-center">
                  {goalStats.completed >= 5 ? '¡Completado!' : `${goalStats.completed}/5`}
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
    </PageLoadingWrapper>
  );
}
