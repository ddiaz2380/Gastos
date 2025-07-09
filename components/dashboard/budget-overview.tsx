'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PieChart, AlertTriangle } from 'lucide-react';
import { mockBudgets } from '@/lib/mock-data';

export function BudgetOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Resumen de Presupuesto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockBudgets.map((budget) => {
            const percentage = (budget.spent / budget.allocated) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: budget.color }}
                    />
                    <span className="font-medium">{budget.category}</span>
                    {(isOverBudget || isNearLimit) && (
                      <AlertTriangle className={`h-4 w-4 ${
                        isOverBudget ? 'text-red-500' : 'text-yellow-500'
                      }`} />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${budget.spent.toLocaleString('en-US')} / ${budget.allocated.toLocaleString('en-US')}
                    </p>
                    <Badge 
                      variant={isOverBudget ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                  style={{
                    '--progress-background': isOverBudget ? '#EF4444' : budget.color
                  } as React.CSSProperties}
                />
                {isOverBudget && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Excede el presupuesto por ${(budget.spent - budget.allocated).toLocaleString('en-US')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}