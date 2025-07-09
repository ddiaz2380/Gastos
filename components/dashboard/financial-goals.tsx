'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  DollarSign,
  Home,
  Car,
  Plane,
  GraduationCap,
  Edit3,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Zap,
  Star
} from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  status: string;
  progress: number;
  remaining: number;
  days_remaining: number;
  formatted_target_amount: string;
  formatted_current_amount: string;
  formatted_remaining: string;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'savings':
    case 'ahorro': return DollarSign;
    case 'house':
    case 'casa':
    case 'home': return Home;
    case 'car':
    case 'auto':
    case 'vehicle': return Car;
    case 'travel':
    case 'viaje': return Plane;
    case 'education':
    case 'educacion': return GraduationCap;
    case 'investment':
    case 'inversion': return TrendingUp;
    default: return Target;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const mockGoalsForDemo = [
  {
    id: 'demo-1',
    name: 'Fondo de Emergencia',
    description: 'Ahorrar para 6 meses de gastos',
    target_amount: 15000,
    current_amount: 8500,
    currency: 'USD',
    target_date: '2024-12-31',
    priority: 'high' as const,
    category: 'savings',
    status: 'active',
    progress: 56.7,
    remaining: 6500,
    days_remaining: 180,
    formatted_target_amount: '$15,000',
    formatted_current_amount: '$8,500',
    formatted_remaining: '$6,500'
  },
  {
    id: 'demo-2',
    name: 'Nuevo Automóvil',
    description: 'Comprar un vehículo híbrido',
    target_amount: 25000,
    current_amount: 12000,
    currency: 'USD',
    target_date: '2025-06-30',
    priority: 'medium' as const,
    category: 'car',
    status: 'active',
    progress: 48.0,
    remaining: 13000,
    days_remaining: 365,
    formatted_target_amount: '$25,000',
    formatted_current_amount: '$12,000',
    formatted_remaining: '$13,000'
  },
  {
    id: 'demo-3',
    name: 'Vacaciones Europa',
    description: 'Viaje de 2 semanas por Europa',
    target_amount: 5000,
    current_amount: 3200,
    currency: 'USD',
    target_date: '2024-08-15',
    priority: 'low' as const,
    category: 'travel',
    status: 'active',
    progress: 64.0,
    remaining: 1800,
    days_remaining: 90,
    formatted_target_amount: '$5,000',
    formatted_current_amount: '$3,200',
    formatted_remaining: '$1,800'
  }
];

export function FinancialGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch('/api/goals?status=active');
        if (response.ok) {
          const goalsData = await response.json();
          setGoals(goalsData.slice(0, 6)); // Mostrar más metas
        } else {
          // Si no hay API, usar datos de demostración
          setGoals(mockGoalsForDemo);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        // Usar datos de demostración en caso de error
        setGoals(mockGoalsForDemo);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = goals.length > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg text-white animate-pulse">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Metas Financieras</CardTitle>
                  <div className="h-4 bg-muted animate-pulse rounded mt-1 w-32" />
                </div>
              </div>
              <Button size="sm" disabled className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Meta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded" />
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-muted rounded" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted rounded w-16" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with Overall Progress */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Metas Financieras</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Progreso general: {overallProgress.toFixed(1)}%
                </p>
              </div>
            </div>
            <Button size="sm" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nueva Meta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progreso Total</span>
              <span className="font-medium">
                {formatCurrency(totalCurrentAmount)} / {formatCurrency(totalTargetAmount)}
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Metas Activas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {goals.filter(g => g.progress >= 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalTargetAmount - totalCurrentAmount)}
                </p>
                <p className="text-xs text-muted-foreground">Por Ahorrar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Target className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No tienes metas financieras</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md">
              Crea tu primera meta financiera y comienza a ahorrar de manera inteligente
            </p>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear tu primera meta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Goals Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal, index) => {
              const IconComponent = getCategoryIcon(goal.category);
              const isSelected = selectedGoal === goal.id;
              const isCompleted = goal.progress >= 100;
              
              return (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 animate-in slide-in-from-bottom-4 ${
                    isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                  } ${
                    isCompleted ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedGoal(isSelected ? null : goal.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-white ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <IconComponent className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{goal.name}</h3>
                          {goal.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(goal.priority)}`}
                      >
                        {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                          <Star className="h-3 w-3 mr-1" />
                          Completada
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span className="font-medium">{goal.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(goal.progress, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.formatted_current_amount}</span>
                        <span>{goal.formatted_target_amount}</span>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <Calendar className="h-3 w-3" />
                        <span>Vence: {new Date(goal.target_date).toLocaleDateString('es-ES')}</span>
                        {goal.days_remaining > 0 ? (
                          <Badge variant="outline" className="ml-auto text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {goal.days_remaining} días
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            Vencida
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="pt-3 border-t space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Agregar Fondos
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Ver Detalles
                          </Button>
                        </div>
                        {!isCompleted && (
                          <Button variant="ghost" size="sm" className="w-full text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Acelerar Meta
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Quick Add Goal Card */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-blue-100 transition-colors">
                <Plus className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Crear Nueva Meta</h3>
              <p className="text-sm text-gray-600 mb-4">
                Define una nueva meta financiera y comienza a ahorrar
              </p>
              <Button variant="outline" size="sm" className="group-hover:bg-blue-50">
                Agregar Meta
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}