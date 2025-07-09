const Database = require('better-sqlite3');
const db = new Database('finance.db');

// Test each query from the dashboard API
console.log('Testing dashboard queries...');

try {
  // Test getAllTransactions
  const getAllTransactions = db.prepare(`
    SELECT t.*, 
           c.name as category_name, 
           c.color as category_color,
           c.icon as category_icon,
           a.name as account_name,
           a.currency as account_currency
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN accounts a ON t.account_id = a.id
    ORDER BY t.date DESC, t.created_at DESC
  `);
  
  const recentTransactions = getAllTransactions.all().slice(0, 5);
  console.log('✓ getAllTransactions working, count:', recentTransactions.length);
  
  // Test getAccountBalancesByCurrency
  const getAccountBalancesByCurrency = db.prepare(`
    SELECT currency, SUM(balance) as total_balance, COUNT(*) as account_count
    FROM accounts 
    WHERE is_active = TRUE
    GROUP BY currency
  `);
  
  const accountBalances = getAccountBalancesByCurrency.all();
  console.log('✓ getAccountBalancesByCurrency working, count:', accountBalances.length);
  
  // Test getMonthlyExpensesByCategory
  const getMonthlyExpensesByCategory = db.prepare(`
    SELECT c.name as category_name, c.color as category_color, c.icon as category_icon,
           SUM(ABS(t.amount)) as total_amount, COUNT(t.id) as transaction_count,
           a.currency
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN accounts a ON t.account_id = a.id
    WHERE t.type = 'expense' 
      AND t.date >= date('now', 'start of month')
      AND t.date < date('now', 'start of month', '+1 month')
    GROUP BY c.id, a.currency
    ORDER BY total_amount DESC
  `);
  
  const monthlyExpenses = getMonthlyExpensesByCategory.all();
  console.log('✓ getMonthlyExpensesByCategory working, count:', monthlyExpenses.length);
  
  // Test getMonthlyIncomeByCategory
  const getMonthlyIncomeByCategory = db.prepare(`
    SELECT c.name as category_name, c.color as category_color, c.icon as category_icon,
           SUM(t.amount) as total_amount, COUNT(t.id) as transaction_count,
           a.currency
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN accounts a ON t.account_id = a.id
    WHERE t.type = 'income' 
      AND t.date >= date('now', 'start of month')
      AND t.date < date('now', 'start of month', '+1 month')
    GROUP BY c.id, a.currency
    ORDER BY total_amount DESC
  `);
  
  const monthlyIncome = getMonthlyIncomeByCategory.all();
  console.log('✓ getMonthlyIncomeByCategory working, count:', monthlyIncome.length);
  
  // Test getDailyExpensesThisMonth
  const getDailyExpensesThisMonth = db.prepare(`
    SELECT DATE(t.date) as date, SUM(ABS(t.amount)) as total_amount, a.currency
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.type = 'expense' 
      AND t.date >= date('now', 'start of month')
      AND t.date < date('now', 'start of month', '+1 month')
    GROUP BY DATE(t.date), a.currency
    ORDER BY date ASC
  `);
  
  const dailyExpenses = getDailyExpensesThisMonth.all();
  console.log('✓ getDailyExpensesThisMonth working, count:', dailyExpenses.length);
  
  console.log('All queries tested successfully!');
  
} catch (error) {
  console.error('Error in query:', error);
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
}

db.close();
