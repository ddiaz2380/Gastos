'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FinanceCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  children?: React.ReactNode;
}

export function FinanceCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  children,
}: FinanceCardProps) {
  // Determine background color based on title
  const getCardStyle = () => {
    if (title.toLowerCase().includes('saldo') || title.toLowerCase().includes('balance')) {
      return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800';
    }
    if (title.toLowerCase().includes('ingreso')) {
      return 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800';
    }
    if (title.toLowerCase().includes('gasto') || title.toLowerCase().includes('expense')) {
      return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800';
    }
    if (title.toLowerCase().includes('neto') || title.toLowerCase().includes('net')) {
      return 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800';
    }
    return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 border-gray-200 dark:border-gray-800';
  };

  const getIconColor = () => {
    if (title.toLowerCase().includes('saldo') || title.toLowerCase().includes('balance')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (title.toLowerCase().includes('ingreso')) {
      return 'text-emerald-600 dark:text-emerald-400';
    }
    if (title.toLowerCase().includes('gasto') || title.toLowerCase().includes('expense')) {
      return 'text-red-600 dark:text-red-400';
    }
    if (title.toLowerCase().includes('neto') || title.toLowerCase().includes('net')) {
      return 'text-purple-600 dark:text-purple-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className={cn('transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1', getCardStyle(), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className={cn('p-2 rounded-full bg-white/50 dark:bg-black/20', getIconColor())}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}