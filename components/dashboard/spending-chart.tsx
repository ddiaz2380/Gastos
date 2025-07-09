'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Consistent number formatting function to prevent hydration issues
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('$', '');
};
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { getMonthlySpending, getCategorySpending } from '@/lib/mock-data';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Clock
} from 'lucide-react';

// Enhanced data structures with more detailed information
const monthlySpendingData = [
  { month: 'Ene', gastos: 2400, ingresos: 4500, presupuesto: 3000, ahorro: 2100 },
  { month: 'Feb', gastos: 1398, ingresos: 4200, presupuesto: 3000, ahorro: 2802 },
  { month: 'Mar', gastos: 2800, ingresos: 4800, presupuesto: 3000, ahorro: 2000 },
  { month: 'Abr', gastos: 3208, ingresos: 4500, presupuesto: 3000, ahorro: 1292 },
  { month: 'May', gastos: 2600, ingresos: 4700, presupuesto: 3000, ahorro: 2100 },
  { month: 'Jun', gastos: 2950, ingresos: 4600, presupuesto: 3000, ahorro: 1650 },
];

const categorySpendingData = [
  { 
    name: 'Alimentación', 
    value: 850, 
    percentage: 28.5, 
    budget: 1000,
    color: '#10B981',
    trend: 5.2,
    transactions: 24
  },
  { 
    name: 'Transporte', 
    value: 420, 
    percentage: 14.1, 
    budget: 500,
    color: '#3B82F6',
    trend: -2.1,
    transactions: 12
  },
  { 
    name: 'Entretenimiento', 
    value: 380, 
    percentage: 12.7, 
    budget: 300,
    color: '#F59E0B',
    trend: 15.3,
    transactions: 8
  },
  { 
    name: 'Servicios', 
    value: 650, 
    percentage: 21.8, 
    budget: 700,
    color: '#EF4444',
    trend: 1.8,
    transactions: 6
  },
  { 
    name: 'Salud', 
    value: 280, 
    percentage: 9.4, 
    budget: 400,
    color: '#8B5CF6',
    trend: -8.5,
    transactions: 4
  },
  { 
    name: 'Otros', 
    value: 400, 
    percentage: 13.4, 
    budget: 300,
    color: '#6B7280',
    trend: 3.2,
    transactions: 15
  },
];

const weeklyTrendData = [
  { day: 'Lun', gastos: 45, meta: 50 },
  { day: 'Mar', gastos: 52, meta: 50 },
  { day: 'Mié', gastos: 38, meta: 50 },
  { day: 'Jue', gastos: 61, meta: 50 },
  { day: 'Vie', gastos: 73, meta: 50 },
  { day: 'Sáb', gastos: 89, meta: 50 },
  { day: 'Dom', gastos: 42, meta: 50 },
];

const budgetProgressData = [
  { category: 'Alimentación', used: 85, total: 100, color: '#10B981' },
  { category: 'Transporte', used: 84, total: 100, color: '#3B82F6' },
  { category: 'Entretenimiento', used: 127, total: 100, color: '#F59E0B' },
  { category: 'Servicios', used: 93, total: 100, color: '#EF4444' },
  { category: 'Salud', used: 70, total: 100, color: '#8B5CF6' },
];

export function SpendingChart() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const monthlyData = getMonthlySpending();
  const categoryData = getCategorySpending();

  const totalSpending = categorySpendingData.reduce((sum, item) => sum + item.value, 0);
  const totalBudget = categorySpendingData.reduce((sum, item) => sum + item.budget, 0);
  const budgetUsagePercentage = (totalSpending / totalBudget) * 100;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Gastado: ${data.value}</p>
          <p className="text-sm text-gray-600">Presupuesto: ${data.budget}</p>
          <p className="text-sm text-gray-600">Transacciones: {data.transactions}</p>
          <div className="flex items-center gap-1 mt-1">
            {data.trend > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-red-500" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-green-500" />
            )}
            <span className={`text-xs font-medium ${
              data.trend > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {Math.abs(data.trend)}% vs mes anterior
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500 rounded-lg text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Análisis de Gastos</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualización detallada de tus patrones de gasto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white/50">
                ${formatCurrency(totalSpending)} gastados
              </Badge>
              <Badge 
                variant={budgetUsagePercentage > 100 ? "destructive" : "secondary"}
                className="bg-white/50"
              >
                {budgetUsagePercentage.toFixed(0)}% del presupuesto
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Período:</span>
        {['1m', '3m', '6m', '1y'].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            {period === '1m' && '1 Mes'}
            {period === '3m' && '3 Meses'}
            {period === '6m' && '6 Meses'}
            {period === '1y' && '1 Año'}
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Tendencias</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Categorías</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Presupuesto</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Spending Chart */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Gastos vs Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                      type="category"
                    />
                    <YAxis 
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                      type="number"
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${formatCurrency(value)}`, '']}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="income" fill="#10B981" name="Ingresos" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#EF4444" name="Gastos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-purple-600" />
                  Distribución por Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="amount"
                      onMouseEnter={(_, index) => setHoveredCategory(categoryData[index]?.category || null)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={hoveredCategory === entry.category ? '#333' : 'none'}
                          strokeWidth={hoveredCategory === entry.category ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`$${formatCurrency(value)}`, 'Cantidad']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {categoryData.map((item) => (
                    <div key={item.category} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">{item.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}