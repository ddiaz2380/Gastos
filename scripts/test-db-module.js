// Test the exact database module
const path = require('path');
const fs = require('fs');

// Test if the module can be imported
try {
  // This should work if we're in the right directory
  const { dbQueries } = require('../lib/database.ts');
  console.log('✓ Database module imported successfully');
  
  // Test the queries
  console.log('Testing dbQueries...');
  
  const recentTransactions = dbQueries.getAllTransactions.all().slice(0, 5);
  console.log('✓ getAllTransactions working, count:', recentTransactions.length);
  
  const accountBalances = dbQueries.getAccountBalancesByCurrency.all();
  console.log('✓ getAccountBalancesByCurrency working, count:', accountBalances.length);
  
  const monthlyExpenses = dbQueries.getMonthlyExpensesByCategory.all();
  console.log('✓ getMonthlyExpensesByCategory working, count:', monthlyExpenses.length);
  
  const monthlyIncome = dbQueries.getMonthlyIncomeByCategory.all();
  console.log('✓ getMonthlyIncomeByCategory working, count:', monthlyIncome.length);
  
  const dailyExpenses = dbQueries.getDailyExpensesThisMonth.all();
  console.log('✓ getDailyExpensesThisMonth working, count:', dailyExpenses.length);
  
  console.log('All dbQueries tested successfully!');
  
} catch (error) {
  console.error('Error:', error);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
}
