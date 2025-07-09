import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const db = new Database('./database.db');

interface PaymentAnalytics {
  totalPayments: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  onTimePercentage: number;
  averagePaymentAmount: number;
  monthlyTrend: Array<{
    month: string;
    paid: number;
    pending: number;
    overdue: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  upcomingPayments: Array<{
    id: string;
    name: string;
    amount: number;
    due_date: string;
    category: string;
    priority: string;
  }>;
}

interface PaymentInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  action?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '6m';
    const category = searchParams.get('category') || 'all';

    // Calculate date range
    const months = parseInt(timeRange.replace('m', ''));
    const startDate = startOfMonth(subMonths(new Date(), months));
    const endDate = endOfMonth(new Date());

    // Base query conditions
    let whereClause = 'WHERE created_at >= ? AND created_at <= ?';
    let params: any[] = [startDate.toISOString(), endDate.toISOString()];

    if (category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    // Get total payments and amounts
    const totalQuery = `
      SELECT 
        COUNT(*) as totalPayments,
        SUM(amount) as totalAmount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paidAmount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdueAmount,
        AVG(amount) as averagePaymentAmount
      FROM payments 
      ${whereClause}
    `;

    const totals = db.prepare(totalQuery).get(...params) as any;

    // Calculate on-time percentage
    const onTimeQuery = `
      SELECT 
        COUNT(*) as totalPaid,
        SUM(CASE WHEN paid_date <= due_date THEN 1 ELSE 0 END) as onTimePaid
      FROM payments 
      ${whereClause} AND status = 'paid' AND paid_date IS NOT NULL
    `;

    const onTimeData = db.prepare(onTimeQuery).get(...params) as any;
    const onTimePercentage = onTimeData.totalPaid > 0 ? (onTimeData.onTimePaid / onTimeData.totalPaid) * 100 : 0;

    // Get monthly trend
    const monthlyTrendQuery = `
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdue
      FROM payments 
      ${whereClause}
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month
    `;

    const monthlyData = db.prepare(monthlyTrendQuery).all(...params) as any[];
    
    // Fill missing months with zero values
    const monthlyTrend = [];
    for (let i = 0; i < months; i++) {
      const monthDate = subMonths(new Date(), months - 1 - i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthName = format(monthDate, 'MMM yyyy', { locale: es });
      
      const existingData = monthlyData.find(d => d.month === monthKey);
      monthlyTrend.push({
        month: monthName,
        paid: existingData?.paid || 0,
        pending: existingData?.pending || 0,
        overdue: existingData?.overdue || 0
      });
    }

    // Get category breakdown
    const categoryQuery = `
      SELECT 
        category,
        SUM(amount) as amount,
        COUNT(*) as count
      FROM payments 
      ${whereClause}
      GROUP BY category
      ORDER BY amount DESC
    `;

    const categoryData = db.prepare(categoryQuery).all(...params) as any[];
    const categoryBreakdown = categoryData.map(cat => ({
      ...cat,
      percentage: (cat.amount / totals.totalAmount) * 100
    }));

    // Get upcoming payments (next 30 days)
    const upcomingQuery = `
      SELECT id, name, amount, due_date, category, priority
      FROM payments 
      WHERE status = 'pending' 
        AND due_date >= date('now') 
        AND due_date <= date('now', '+30 days')
      ORDER BY due_date ASC
      LIMIT 10
    `;

    const upcomingPayments = db.prepare(upcomingQuery).all() as any[];

    // Generate insights
    const insights: PaymentInsight[] = [];

    // Check for overdue payments
    if (totals.overdueAmount > 0) {
      insights.push({
        type: 'warning',
        title: 'Pagos Vencidos',
        description: `Tienes $${totals.overdueAmount.toLocaleString()} en pagos vencidos que requieren atención inmediata.`,
        action: 'Revisar Pagos Vencidos'
      });
    }

    // Check on-time performance
    if (onTimePercentage >= 90) {
      insights.push({
        type: 'success',
        title: 'Excelente Rendimiento',
        description: `Tienes un ${onTimePercentage.toFixed(1)}% de pagos a tiempo. ¡Sigue así!`,
      });
    } else if (onTimePercentage < 70) {
      insights.push({
        type: 'warning',
        title: 'Mejora Necesaria',
        description: `Solo el ${onTimePercentage.toFixed(1)}% de tus pagos son a tiempo. Considera configurar más recordatorios.`,
        action: 'Configurar Recordatorios'
      });
    }

    // Check for high spending categories
    const topCategory = categoryBreakdown[0];
    if (topCategory && topCategory.percentage > 50) {
      insights.push({
        type: 'info',
        title: 'Categoría Dominante',
        description: `${topCategory.category} representa el ${topCategory.percentage.toFixed(1)}% de tus pagos. Considera revisar si hay oportunidades de optimización.`,
        action: 'Analizar Categoría'
      });
    }

    // Check upcoming payment load
    const upcomingAmount = upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    if (upcomingAmount > totals.averagePaymentAmount * 5) {
      insights.push({
        type: 'info',
        title: 'Carga de Pagos Alta',
        description: `Tienes $${upcomingAmount.toLocaleString()} en pagos próximos. Asegúrate de tener suficiente liquidez.`,
        action: 'Planificar Flujo de Caja'
      });
    }

    const analytics: PaymentAnalytics = {
      totalPayments: totals.totalPayments || 0,
      totalAmount: totals.totalAmount || 0,
      paidAmount: totals.paidAmount || 0,
      pendingAmount: totals.pendingAmount || 0,
      overdueAmount: totals.overdueAmount || 0,
      onTimePercentage,
      averagePaymentAmount: totals.averagePaymentAmount || 0,
      monthlyTrend,
      categoryBreakdown,
      upcomingPayments
    };

    return NextResponse.json({ analytics, insights });
  } catch (error) {
    console.error('Error fetching payment analytics:', error);
    return NextResponse.json(
      { error: 'Error al obtener los análisis de pagos' },
      { status: 500 }
    );
  }
}