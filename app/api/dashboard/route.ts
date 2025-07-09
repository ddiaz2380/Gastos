import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/database';
import { formatCurrency, convertCurrency, CURRENCIES } from '@/lib/currency';

export async function GET() {
  try {
    // Obtener transacciones recientes
    const recentTransactions = dbQueries.getAllTransactions.all().slice(0, 5);
    
    // Obtener estadísticas por moneda
    const accountBalances = dbQueries.getAccountBalancesByCurrency.all();
    const monthlyExpenses = dbQueries.getMonthlyExpensesByCategory.all();
    const monthlyIncome = dbQueries.getMonthlyIncomeByCategory.all();
    
    // Calcular totales por moneda
    const statsByCurrency: any = {};
    
    // Inicializar estadísticas para cada moneda
    Object.keys(CURRENCIES).forEach(currency => {
      statsByCurrency[currency] = {
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        accountCount: 0
      };
    });
    
    // Procesar balances de cuentas
    accountBalances.forEach((item: any) => {
      if (statsByCurrency[item.currency]) {
        statsByCurrency[item.currency].totalBalance = item.total_balance;
        statsByCurrency[item.currency].accountCount = item.account_count;
      }
    });
    
    // Procesar ingresos mensuales
    monthlyIncome.forEach((item: any) => {
      if (statsByCurrency[item.currency]) {
        statsByCurrency[item.currency].totalIncome += item.total_amount;
      }
    });
    
    // Procesar gastos mensuales
    monthlyExpenses.forEach((item: any) => {
      if (statsByCurrency[item.currency]) {
        statsByCurrency[item.currency].totalExpenses += item.total_amount;
      }
    });
    
    // Calcular balance mensual para cada moneda
    Object.keys(statsByCurrency).forEach(currency => {
      const stats = statsByCurrency[currency];
      stats.balance = stats.totalIncome - stats.totalExpenses;
    });
    
    // Obtener gastos diarios del mes
    const dailyExpenses = dbQueries.getDailyExpensesThisMonth.all();
    
    // Agrupar gastos diarios por moneda
    const dailyExpensesByCurrency: any = {};
    dailyExpenses.forEach((item: any) => {
      if (!dailyExpensesByCurrency[item.currency]) {
        dailyExpensesByCurrency[item.currency] = [];
      }
      dailyExpensesByCurrency[item.currency].push({
        date: item.date,
        amount: item.total_amount
      });
    });
    
    // Formatear transacciones recientes con información de moneda
    const formattedRecentTransactions = recentTransactions.map((transaction: any) => ({
      ...transaction,
      formatted_amount: formatCurrency(transaction.amount, transaction.account_currency)
    }));
    
    // Calcular totales consolidados para overview (usando USD como base)
    let totalBalance = 0;
    let totalMonthlyIncome = 0;
    let totalMonthlyExpenses = 0;
    
    // Convertir y sumar todos los valores a USD
    Object.keys(statsByCurrency).forEach(currency => {
      const stats = statsByCurrency[currency];
      if (currency === 'USD') {
        totalBalance += stats.totalBalance;
        totalMonthlyIncome += stats.totalIncome;
        totalMonthlyExpenses += stats.totalExpenses;
      } else {
        // Para otras monedas, convertir a USD (usando tasa de cambio simple)
        const rate = currency === 'EUR' ? 1.1 : currency === 'ARS' ? 0.001 : 1;
        totalBalance += stats.totalBalance * rate;
        totalMonthlyIncome += stats.totalIncome * rate;
        totalMonthlyExpenses += stats.totalExpenses * rate;
      }
    });
    
    const netIncome = totalMonthlyIncome - totalMonthlyExpenses;
    
    return NextResponse.json({
      overview: {
        totalBalance,
        monthlyIncome: totalMonthlyIncome,
        monthlyExpenses: totalMonthlyExpenses,
        netIncome
      },
      recentTransactions: formattedRecentTransactions,
      statsByCurrency,
      dailyExpensesByCurrency,
      monthlyExpensesByCategory: monthlyExpenses,
      monthlyIncomeByCategory: monthlyIncome,
      supportedCurrencies: Object.keys(CURRENCIES)
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}