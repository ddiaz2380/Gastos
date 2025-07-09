import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '6m';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '12m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    // Get monthly data
    const monthlyData = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        strftime('%Y', date) as year,
        strftime('%m', date) as month_num,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        COUNT(*) as transaction_count
      FROM transactions 
      WHERE account_id = ? 
        AND date >= ? 
        AND date <= ?
      GROUP BY strftime('%Y-%m', date)
      ORDER BY year, month_num
    `).all(accountId, startDate.toISOString().split('T')[0], now.toISOString().split('T')[0]) as any[];

    // Format the data with month names
    const formattedData = monthlyData.map((row: any) => {
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const monthIndex = parseInt(row.month_num) - 1;
      const monthName = monthNames[monthIndex];
      
      return {
        month: `${monthName} ${row.year}`,
        income: row.income || 0,
        expenses: row.expenses || 0,
        balance: (row.income || 0) - (row.expenses || 0),
        transaction_count: row.transaction_count
      };
    });

    // Fill in missing months with zero values
    const completeData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const existingData = formattedData.find((d: any) => 
        d.month === `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      );
      
      if (existingData) {
        completeData.push(existingData);
      } else {
        completeData.push({
          month: `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
          income: 0,
          expenses: 0,
          balance: 0,
          transaction_count: 0
        });
      }
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return NextResponse.json(completeData);
  } catch (error) {
    console.error('Error fetching monthly data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}