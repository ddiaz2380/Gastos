const path = require('path');
const Database = require('better-sqlite3');

// Recreate the database path
const dbPath = path.join(__dirname, '..', 'finance.db');
console.log('Database path:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Función para migrar datos adicionales
function migrateAdditionalData() {
  console.log('Migrando datos adicionales...');
  
  // Verificar si ya hay datos adicionales
  const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  if (transactionCount.count > 20) {
    console.log('Los datos adicionales ya existen, saltando migración');
    return;
  }

  // Insertar categorías adicionales en inglés para compatibilidad con mock data
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, type, color, icon, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Categorías de gastos adicionales
  insertCategory.run('cat-food', 'Food & Dining', 'expense', '#3B82F6', '🍽️', 'Comidas y restaurantes');
  insertCategory.run('cat-housing', 'Housing', 'expense', '#10B981', '🏠', 'Alquiler y gastos del hogar');
  insertCategory.run('cat-transport', 'Transportation', 'expense', '#8B5CF6', '🚗', 'Transporte y combustible');
  insertCategory.run('cat-entertainment', 'Entertainment', 'expense', '#F59E0B', '🎬', 'Entretenimiento y suscripciones');
  insertCategory.run('cat-healthcare', 'Healthcare', 'expense', '#EF4444', '🏥', 'Salud y medicina');
  insertCategory.run('cat-shopping', 'Shopping', 'expense', '#06B6D4', '🛍️', 'Compras y productos');
  insertCategory.run('cat-utilities', 'Utilities', 'expense', '#84CC16', '💡', 'Servicios públicos');
  insertCategory.run('cat-education', 'Education', 'expense', '#6366F1', '📚', 'Educación y cursos');
  insertCategory.run('cat-travel', 'Travel', 'expense', '#EC4899', '✈️', 'Viajes y turismo');
  insertCategory.run('cat-insurance', 'Insurance', 'expense', '#64748B', '🛡️', 'Seguros');

  // Categorías de ingresos adicionales
  insertCategory.run('cat-salary', 'Salary', 'income', '#22C55E', '💼', 'Salario principal');
  insertCategory.run('cat-freelance', 'Freelance', 'income', '#06B6D4', '💻', 'Trabajos freelance');
  insertCategory.run('cat-business', 'Business', 'income', '#8B5CF6', '💼', 'Ingresos de negocio');
  insertCategory.run('cat-other', 'Other', 'income', '#84CC16', '💰', 'Otros ingresos');

  // Insertar cuentas adicionales más realistas
  const insertAccount = db.prepare(`
    INSERT OR IGNORE INTO accounts (id, name, type, balance, currency, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAccount.run('acc-main-checking', 'Main Checking', 'checking', 4250.75, 'USD', 'Cuenta corriente principal');
  insertAccount.run('acc-high-yield', 'High Yield Savings', 'savings', 12500.00, 'USD', 'Cuenta de ahorro con alto rendimiento');
  insertAccount.run('acc-credit-card', 'Credit Card', 'credit', -850.25, 'USD', 'Tarjeta de crédito principal');
  insertAccount.run('acc-investment', 'Investment Portfolio', 'investment', 25000.00, 'USD', 'Cartera de inversiones');

  // Insertar transacciones más realistas basadas en mock data
  const insertTransaction = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, account_id, category_id, amount, description, date, type, tags, location, is_recurring, recurring_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Transacciones de gastos
  insertTransaction.run('mock-1', 'acc-main-checking', 'cat-food', -85.50, 'Grocery shopping at Whole Foods', '2024-01-15', 'expense', '["groceries","essential"]', 'Whole Foods', 0, null);
  insertTransaction.run('mock-2', 'acc-main-checking', 'cat-housing', -1200.00, 'Monthly rent payment', '2024-01-01', 'expense', '["rent","housing"]', null, 1, 'monthly');
  insertTransaction.run('mock-3', 'acc-credit-card', 'cat-entertainment', -45.99, 'Netflix subscription', '2024-01-10', 'expense', '["streaming","subscription"]', null, 1, 'monthly');
  insertTransaction.run('mock-4', 'acc-main-checking', 'cat-transport', -120.00, 'Gas and car maintenance', '2024-01-12', 'expense', '["car","fuel"]', 'Shell Gas Station', 0, null);
  insertTransaction.run('mock-5', 'acc-main-checking', 'cat-shopping', -230.00, 'Clothing shopping', '2024-01-18', 'expense', '["clothes","shopping"]', 'Mall', 0, null);
  insertTransaction.run('mock-6', 'acc-main-checking', 'cat-healthcare', -85.00, 'Doctor consultation', '2024-01-20', 'expense', '["medical","health"]', 'Medical Center', 0, null);
  insertTransaction.run('mock-7', 'acc-main-checking', 'cat-utilities', -150.00, 'Electric bill', '2024-01-05', 'expense', '["electricity","utilities"]', null, 1, 'monthly');
  insertTransaction.run('mock-8', 'acc-main-checking', 'cat-utilities', -80.00, 'Internet bill', '2024-01-08', 'expense', '["internet","utilities"]', null, 1, 'monthly');

  // Transacciones de ingresos
  insertTransaction.run('mock-income-1', 'acc-main-checking', 'cat-salary', 3500.00, 'Monthly salary', '2024-01-01', 'income', '["salary","primary-income"]', 'Company Office', 1, 'monthly');
  insertTransaction.run('mock-income-2', 'acc-main-checking', 'cat-freelance', 500.00, 'Web development project', '2024-01-08', 'income', '["freelance","side-income"]', 'Remote Work', 0, null);
  insertTransaction.run('mock-income-3', 'acc-main-checking', 'cat-freelance', 750.00, 'Consulting work', '2024-01-22', 'income', '["consulting","freelance"]', 'Client Office', 0, null);

  // Insertar más transacciones para febrero
  insertTransaction.run('mock-feb-1', 'acc-main-checking', 'cat-salary', 3500.00, 'Monthly salary - February', '2024-02-01', 'income', '["salary","primary-income"]', 'Company Office', 1, 'monthly');
  insertTransaction.run('mock-feb-2', 'acc-main-checking', 'cat-housing', -1200.00, 'Monthly rent - February', '2024-02-01', 'expense', '["rent","housing"]', null, 1, 'monthly');
  insertTransaction.run('mock-feb-3', 'acc-main-checking', 'cat-food', -95.75, 'Grocery shopping', '2024-02-03', 'expense', '["groceries","food"]', 'Supermarket', 0, null);
  insertTransaction.run('mock-feb-4', 'acc-main-checking', 'cat-transport', -60.00, 'Public transport monthly pass', '2024-02-01', 'expense', '["transport","public"]', 'Transit Station', 1, 'monthly');
  insertTransaction.run('mock-feb-5', 'acc-credit-card', 'cat-entertainment', -25.00, 'Movie tickets', '2024-02-14', 'expense', '["movies","date"]', 'Cinema', 0, null);

  // Insertar presupuestos más detallados
  const insertBudget = db.prepare(`
    INSERT OR IGNORE INTO budgets (id, category_id, amount, period, start_date, currency, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertBudget.run('budget-food', 'cat-food', 600.00, 'monthly', '2024-01-01', 'USD', 0.8);
  insertBudget.run('budget-housing', 'cat-housing', 1500.00, 'monthly', '2024-01-01', 'USD', 0.9);
  insertBudget.run('budget-transport', 'cat-transport', 300.00, 'monthly', '2024-01-01', 'USD', 0.8);
  insertBudget.run('budget-entertainment', 'cat-entertainment', 200.00, 'monthly', '2024-01-01', 'USD', 0.7);
  insertBudget.run('budget-healthcare', 'cat-healthcare', 250.00, 'monthly', '2024-01-01', 'USD', 0.8);
  insertBudget.run('budget-shopping', 'cat-shopping', 400.00, 'monthly', '2024-01-01', 'USD', 0.8);
  insertBudget.run('budget-utilities', 'cat-utilities', 350.00, 'monthly', '2024-01-01', 'USD', 0.9);

  // Insertar metas más realistas
  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO goals (id, title, description, target_amount, current_amount, target_date, category, priority, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGoal.run('goal-emergency', 'Emergency Fund', 'Build emergency fund for 6 months of expenses', 10000.00, 6500.00, '2024-12-31', 'emergency', 'high', 'USD');
  insertGoal.run('goal-vacation', 'Vacation to Europe', 'Save for European vacation trip', 5000.00, 2300.00, '2024-08-15', 'travel', 'medium', 'USD');
  insertGoal.run('goal-laptop', 'New Laptop', 'Save for new MacBook Pro', 2500.00, 1800.00, '2024-06-01', 'technology', 'low', 'USD');
  insertGoal.run('goal-car', 'Car Down Payment', 'Save for car down payment', 8000.00, 3200.00, '2024-09-30', 'vehicle', 'medium', 'USD');
  insertGoal.run('goal-house', 'House Down Payment', 'Save for house down payment', 50000.00, 15000.00, '2025-12-31', 'real-estate', 'high', 'USD');

  // Insertar pagos adicionales
  const insertPayment = db.prepare(`
    INSERT OR IGNORE INTO payments (id, name, amount, due_date, status, category, description, account_id, currency, is_recurring, recurring_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayment.run('payment-rent', 'Monthly Rent', 1200.00, '2024-02-01', 'pending', 'housing', 'Apartment rent payment', 'acc-main-checking', 'USD', 1, 'monthly');
  insertPayment.run('payment-netflix', 'Netflix Subscription', 15.99, '2024-02-10', 'pending', 'entertainment', 'Monthly Netflix subscription', 'acc-credit-card', 'USD', 1, 'monthly');
  insertPayment.run('payment-electric', 'Electric Bill', 150.00, '2024-02-15', 'pending', 'utilities', 'Monthly electricity bill', 'acc-main-checking', 'USD', 1, 'monthly');
  insertPayment.run('payment-internet', 'Internet Bill', 80.00, '2024-02-20', 'pending', 'utilities', 'Monthly internet service', 'acc-main-checking', 'USD', 1, 'monthly');
  insertPayment.run('payment-insurance', 'Car Insurance', 120.00, '2024-02-25', 'pending', 'insurance', 'Monthly car insurance', 'acc-main-checking', 'USD', 1, 'monthly');
  insertPayment.run('payment-gym', 'Gym Membership', 45.00, '2024-02-28', 'pending', 'health', 'Monthly gym membership', 'acc-main-checking', 'USD', 1, 'monthly');

  console.log('Datos adicionales migrados exitosamente!');
}

// Función para actualizar datos existentes con fechas más recientes
function updateDataWithRecentDates() {
  console.log('Actualizando datos con fechas más recientes...');
  
  // Actualizar transacciones existentes con fechas de 2024
  const updateTransactionDates = db.prepare(`
    UPDATE transactions 
    SET date = CASE 
      WHEN date LIKE '2024-01-%' THEN '2024-12-' || substr(date, 9)
      WHEN date LIKE '2024-02-%' THEN '2025-01-' || substr(date, 9)
      ELSE date 
    END
    WHERE date < '2024-12-01'
  `);
  
  updateTransactionDates.run();
  
  // Actualizar fechas de vencimiento de pagos
  const updatePaymentDates = db.prepare(`
    UPDATE payments 
    SET due_date = '2025-01-' || substr(due_date, 9)
    WHERE due_date LIKE '2024-02-%'
  `);
  
  updatePaymentDates.run();
  
  console.log('Fechas actualizadas exitosamente!');
}

// Función para mostrar estadísticas de la base de datos
function showDatabaseStats() {
  console.log('\n=== ESTADÍSTICAS DE LA BASE DE DATOS ===');
  
  const stats = {
    accounts: db.prepare('SELECT COUNT(*) as count FROM accounts').get(),
    categories: db.prepare('SELECT COUNT(*) as count FROM categories').get(),
    transactions: db.prepare('SELECT COUNT(*) as count FROM transactions').get(),
    budgets: db.prepare('SELECT COUNT(*) as count FROM budgets').get(),
    goals: db.prepare('SELECT COUNT(*) as count FROM goals').get(),
    payments: db.prepare('SELECT COUNT(*) as count FROM payments').get()
  };
  
  console.log(`📊 Cuentas: ${stats.accounts.count}`);
  console.log(`📂 Categorías: ${stats.categories.count}`);
  console.log(`💳 Transacciones: ${stats.transactions.count}`);
  console.log(`📈 Presupuestos: ${stats.budgets.count}`);
  console.log(`🎯 Metas: ${stats.goals.count}`);
  console.log(`💰 Pagos: ${stats.payments.count}`);
  
  // Mostrar balance total por moneda
  const balancesByCurrency = db.prepare(`
    SELECT currency, SUM(balance) as total_balance 
    FROM accounts 
    GROUP BY currency
  `).all();
  
  console.log('\n💰 BALANCES POR MONEDA:');
  balancesByCurrency.forEach(item => {
    console.log(`${item.currency}: ${item.total_balance.toLocaleString()}`);
  });
}

// Ejecutar migración
console.log('🚀 Iniciando migración de datos adicionales...');
try {
  migrateAdditionalData();
  updateDataWithRecentDates();
  showDatabaseStats();
  console.log('\n✅ Migración completada exitosamente!');
} catch (error) {
  console.error('❌ Error durante la migración:', error);
  process.exit(1);
} finally {
  db.close();
}
