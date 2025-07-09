'use client';

import React, { useState, useEffect } from 'react';
import { PageLoadingWrapper } from '@/components/ui/page-loading-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLoading } from '@/components/providers/loading-provider';
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Wallet,
  BarChart3,
  Clock,
  Zap,
  Trophy,
  Utensils,
  Car,
  Film,
  Heart,
  BookOpen,
  Home,
  Shirt,
  Laptop,
  Plane,
  Package,
  PieChart
} from 'lucide-react';

interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  category_id: number;
  period: 'monthly' | 'weekly' | 'yearly';
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface BudgetForm {
  name: string;
  amount: string;
  category_id: string;
  period: 'monthly' | 'weekly' | 'yearly';
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { setLoading } = useLoading();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState<BudgetForm>({
    name: '',
    amount: '',
    category_id: '',
    period: 'monthly'
  });

  const [budgetStats, setBudgetStats] = useState({
    total: 0,
    overBudget: 0,
    warning: 0,
    totalSpent: 0,
    totalBudgeted: 0
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [budgets]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const [response] = await Promise.all([
        fetch('/api/budgets'),
        new Promise(resolve => setTimeout(resolve, 1000)) // Minimum 1 second delay
      ]);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
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

  const calculateStats = () => {
    const total = budgets.length;
    const overBudget = budgets.filter(budget => budget.spent > budget.amount).length;
    const warning = budgets.filter(budget => {
      const percentage = (budget.spent / budget.amount) * 100;
      return percentage >= 80 && percentage < 100;
    }).length;
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);

    setBudgetStats({
      total,
      overBudget,
      warning,
      totalSpent,
      totalBudgeted
    });
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id),
          period: formData.period
        }),
      });

      if (response.ok) {
        fetchBudgets();
        setShowForm(false);
        setFormData({ name: '', amount: '', category_id: '', period: 'monthly' });
      }
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          category_id: parseInt(formData.category_id),
          period: formData.period
        }),
      });

      if (response.ok) {
        fetchBudgets();
        setEditingBudget(null);
        setFormData({ name: '', amount: '', category_id: '', period: 'monthly' });
      }
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteBudget = async (id: number) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBudgets();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const startEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      category_id: budget.category_id.toString(),
      period: budget.period
    });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return 'destructive';
    if (percentage >= 80) return 'warning';
    return 'default';
  };

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'Alimentación': Utensils,
      'Transporte': Car,
      'Entretenimiento': Film,
      'Salud': Heart,
      'Educación': BookOpen,
      'Hogar': Home,
      'Ropa': Shirt,
      'Tecnología': Laptop,
      'Viajes': Plane,
      'Otros': Package
    };
    return iconMap[categoryName] || Wallet;
  };

  return (
    <PageLoadingWrapper 
      loadingMessage="Cargando presupuestos..." 
      minDuration={1500}
      showProgress={true}
    >
      <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-transparent" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Wallet className="h-8 w-8 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Gestión de Presupuestos</h1>
                  <p className="text-blue-100 text-lg">
                    Controla tus gastos y mantén tus finanzas bajo control
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <Target className="h-4 w-4 text-green-300" />
                  <span className="text-sm font-medium">{budgetStats.total} Presupuestos</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  <span className="text-sm font-medium">{budgetStats.overBudget} Excedidos</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-blue-300" />
                  <span className="text-sm font-medium">${budgetStats.totalSpent.toLocaleString()} Gastado</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowForm(true)}
                size="lg"
                className="bg-white text-blue-600 hover:bg-white/90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Presupuesto
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setActiveTab('analytics')}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Análisis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Presupuestos</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-600 dark:text-blue-400">Activos</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center">
                <Zap className="h-2 w-2 text-cyan-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{budgetStats.total}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                {budgetStats.total > 0 ? 'Configurados' : 'Sin configurar'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-red-950/30 dark:via-pink-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Presupuestos Excedidos</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-600 dark:text-red-400">Crítico</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center">
                <AlertTriangle className="h-2 w-2 text-orange-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">{budgetStats.overBudget}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                {budgetStats.total > 0 ? ((budgetStats.overBudget / budgetStats.total) * 100).toFixed(1) : 0}% del total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/30 dark:via-amber-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">En Alerta</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs text-yellow-600 dark:text-yellow-400">Precaución</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                <Clock className="h-2 w-2 text-amber-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">{budgetStats.warning}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300">
                Cerca del límite
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 border-green-200 dark:border-green-800 hover:shadow-xl hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Gastado</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400">Progreso</span>
              </div>
            </div>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-2 w-2 text-emerald-800" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">${budgetStats.totalSpent.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                {budgetStats.totalBudgeted > 0 ? ((budgetStats.totalSpent / budgetStats.totalBudgeted) * 100).toFixed(1) : 0}% del presupuesto
              </span>
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
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Presupuestos</span>
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
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Vista General de Presupuestos</h3>
            <p className="text-muted-foreground mb-6">Aquí verás un resumen completo de todos tus presupuestos</p>
            <Button onClick={() => setActiveTab('budgets')}>
              Ver Presupuestos
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.amount) * 100;
              const categoryName = categories.find(cat => cat.id === budget.category_id)?.name || 'Otros';
              
              return (
                <Card key={budget.id} className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {React.createElement(getCategoryIcon(categoryName), { className: "h-6 w-6" })}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{budget.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{categoryName}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(budget)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteBudget(budget.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Gastado</span>
                        <span className="text-sm font-bold">
                          ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <Badge 
                          variant={percentage >= 100 ? 'destructive' : percentage >= 80 ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {percentage.toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">
                          {budget.period}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Análisis General */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Análisis General de Presupuestos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <div className="text-2xl font-bold text-blue-600">{budgetStats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Presupuestos</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <div className="text-2xl font-bold text-green-600">
                      {budgetStats.totalBudgeted > 0 ? ((budgetStats.totalSpent / budgetStats.totalBudgeted) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Promedio Gastado</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950/30">
                    <div className="text-2xl font-bold text-red-600">{budgetStats.overBudget}</div>
                    <div className="text-sm text-muted-foreground">Presupuestos Excedidos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Categoría */}
            <Card className="col-span-full md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => {
                    const categoryBudgets = budgets.filter(b => b.category_id === category.id);
                    const totalCategoryBudget = categoryBudgets.reduce((sum, b) => sum + b.amount, 0);
                    const totalCategorySpent = categoryBudgets.reduce((sum, b) => sum + b.spent, 0);
                    const percentage = budgetStats.totalBudgeted > 0 ? (totalCategoryBudget / budgetStats.totalBudgeted) * 100 : 0;
                    
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">${totalCategoryBudget.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Rendimiento por Período */}
            <Card className="col-span-full md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Análisis Detallado por Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const percentage = (budget.spent / budget.amount) * 100;
                    const categoryName = categories.find(cat => cat.id === budget.category_id)?.name || 'Otros';
                    const remaining = budget.amount - budget.spent;
                    
                    return (
                      <div key={budget.id} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-lg">
                              {React.createElement(getCategoryIcon(categoryName), { className: "h-5 w-5" })}
                            </div>
                            <div>
                              <h4 className="font-semibold">{budget.name}</h4>
                              <p className="text-sm text-muted-foreground">{categoryName} • {budget.period}</p>
                            </div>
                          </div>
                          <Badge variant={percentage >= 100 ? 'destructive' : percentage >= 80 ? 'secondary' : 'default'}>
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Gastado: ${budget.spent.toLocaleString()}</span>
                            <span>Presupuesto: ${budget.amount.toLocaleString()}</span>
                          </div>
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {remaining >= 0 ? `Restante: $${remaining.toLocaleString()}` : `Excedido: $${Math.abs(remaining).toLocaleString()}`}
                            </span>
                            <span>
                              {percentage >= 100 ? 'Presupuesto excedido' : 
                               percentage >= 80 ? 'Cerca del límite' : 'Dentro del presupuesto'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {budgets.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No hay presupuestos para analizar</p>
                      <Button 
                        onClick={() => setActiveTab('budgets')} 
                        variant="outline" 
                        className="mt-3"
                      >
                        Crear Primer Presupuesto
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Sistema de Logros</h3>
            <p className="text-muted-foreground">Próximamente: Logros y metas de ahorro</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Budget Dialog */}
      <Dialog open={showForm || editingBudget !== null} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingBudget(null);
          setFormData({ name: '', amount: '', category_id: '', period: 'monthly' });
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </DialogTitle>
            <DialogDescription>
              {editingBudget 
                ? 'Modifica los detalles de tu presupuesto existente.' 
                : 'Crea un nuevo presupuesto para controlar tus gastos.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editingBudget ? handleEditBudget : handleAddBudget} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Presupuesto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Gastos de Alimentación"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select
                value={formData.period}
                onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingBudget(null);
                  setFormData({ name: '', amount: '', category_id: '', period: 'monthly' });
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingBudget ? 'Actualizar' : 'Crear'} Presupuesto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </PageLoadingWrapper>
  );
}