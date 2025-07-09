'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  PieChart,
  Download,
  Upload,
  Calculator,
  Bell,
  Settings,
  CreditCard,
  Wallet,
  TrendingUp,
  FileText,
  Calendar,
  Zap,
  Star,
  DollarSign,
  BarChart3,
  Users,
  Shield,
  Smartphone,
  PiggyBank,
  ArrowUpDown
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  category: 'transaction' | 'analysis' | 'goal' | 'tool' | 'export';
  isNew?: boolean;
  isPremium?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'add-income',
    title: 'Agregar Ingreso',
    description: 'Registra un nuevo ingreso rápidamente',
    icon: ArrowUpRight,
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-200',
    category: 'transaction'
  },
  {
    id: 'add-expense',
    title: 'Nuevo Gasto',
    description: 'Registra un gasto de forma rápida',
    icon: ArrowDownLeft,
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-200',
    category: 'transaction'
  },
  {
    id: 'create-goal',
    title: 'Nueva Meta',
    description: 'Define una nueva meta financiera',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200',
    category: 'goal'
  },
  {
    id: 'pay-bill',
    title: 'Pagar Factura',
    description: 'Registra el pago de una factura',
    icon: CreditCard,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-200',
    category: 'transaction'
  },
  {
    id: 'transfer',
    title: 'Transferencia',
    description: 'Transfiere dinero entre cuentas',
    icon: ArrowUpDown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 hover:bg-purple-200',
    category: 'transaction'
  },
  {
    id: 'save-money',
    title: 'Ahorrar Dinero',
    description: 'Mueve dinero a tus ahorros',
    icon: PiggyBank,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 hover:bg-pink-200',
    category: 'goal'
  },
  {
    id: 'budget-calculator',
    title: 'Calculadora de Presupuesto',
    description: 'Planifica tu presupuesto mensual',
    icon: Calculator,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 hover:bg-indigo-200',
    category: 'tool',
    isNew: true
  },
  {
    id: 'spending-analysis',
    title: 'Análisis de Gastos',
    description: 'Revisa tus patrones de gasto',
    icon: PieChart,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 hover:bg-teal-200',
    category: 'analysis'
  },
  {
    id: 'export-data',
    title: 'Exportar Datos',
    description: 'Descarga tus datos financieros',
    icon: Download,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    category: 'export'
  },
  {
    id: 'import-data',
    title: 'Importar Transacciones',
    description: 'Sube datos desde tu banco',
    icon: Upload,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 hover:bg-cyan-200',
    category: 'export'
  },
  {
    id: 'financial-report',
    title: 'Reporte Financiero',
    description: 'Genera un reporte completo',
    icon: FileText,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 hover:bg-emerald-200',
    category: 'analysis',
    isPremium: true
  },
  {
    id: 'bill-reminder',
    title: 'Recordatorios',
    description: 'Configura alertas de pagos',
    icon: Bell,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200',
    category: 'tool'
  }
];

const categoryFilters = [
  { id: 'all', label: 'Todas', icon: BarChart3 },
  { id: 'transaction', label: 'Transacciones', icon: CreditCard },
  { id: 'analysis', label: 'Análisis', icon: PieChart },
  { id: 'goal', label: 'Metas', icon: Target },
  { id: 'tool', label: 'Herramientas', icon: Settings },
  { id: 'export', label: 'Datos', icon: Download }
];

export function QuickActions() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const handleActionClick = (actionId: string) => {
    console.log(`Executing action: ${actionId}`);
    // Aquí se implementaría la lógica específica para cada acción
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg text-white">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Acciones Rápidas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Herramientas y funciones para gestionar tus finanzas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/50">
                {filteredActions.length} acciones
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((filter) => {
          const IconComponent = filter.icon;
          const isSelected = selectedCategory === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(filter.id)}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isSelected 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'hover:bg-purple-50 hover:border-purple-300'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{filter.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Actions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredActions.map((action, index) => {
          const IconComponent = action.icon;
          const isHovered = hoveredAction === action.id;
          
          return (
            <Card
              key={action.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 animate-in slide-in-from-bottom-4 ${
                isHovered ? 'ring-2 ring-purple-500 shadow-lg' : ''
              } ${
                action.isPremium ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleActionClick(action.id)}
              onMouseEnter={() => setHoveredAction(action.id)}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Icon and Badges */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg transition-colors ${action.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      {action.isNew && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                          <Star className="h-3 w-3 mr-1" />
                          Nuevo
                        </Badge>
                      )}
                      {action.isPremium && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Action Button */}
                  <div className={`transition-all duration-200 ${
                    isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}>
                    <Button 
                      size="sm" 
                      className={`w-full text-xs ${
                        action.isPremium 
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {action.isPremium ? 'Actualizar a Premium' : 'Ejecutar Acción'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-green-500 rounded-full">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">24</p>
            <p className="text-xs text-muted-foreground">Transacciones este mes</p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-500 rounded-full">
                <Target className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-600">3</p>
            <p className="text-xs text-muted-foreground">Metas activas</p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-purple-500 rounded-full">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">12</p>
            <p className="text-xs text-muted-foreground">Reportes generados</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-orange-500 rounded-full">
                <Bell className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">5</p>
            <p className="text-xs text-muted-foreground">Recordatorios activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-950/20">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-gray-500 rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
            Explora nuestras guías y tutoriales para aprovechar al máximo todas las funciones
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm">
              Ver Tutoriales
            </Button>
            <Button variant="outline" size="sm">
              Contactar Soporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}