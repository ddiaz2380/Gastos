const path = require('path');
const Database = require('better-sqlite3');

// Recreate the database path
const dbPath = path.join(__dirname, '..', 'finance.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Función para generar datos de prueba masivos
function generateMassiveTestData() {
  console.log('Generando datos de prueba masivos...');
  
  const insertTransaction = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, account_id, category_id, amount, description, date, type, tags, location, is_recurring, recurring_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Categorías para usar
  const expenseCategories = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5', 'cat-food', 'cat-transport', 'cat-entertainment', 'cat-utilities'];
  const incomeCategories = ['cat-11', 'cat-12', 'cat-13', 'cat-salary', 'cat-freelance'];
  const accounts = ['acc-1', 'acc-2', 'acc-3', 'acc-4', 'acc-main-checking', 'acc-high-yield'];

  // Generar transacciones para los últimos 6 meses
  const startDate = new Date('2024-07-01');
  const endDate = new Date('2025-01-07');
  
  let transactionCounter = 1000;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Generar 1-3 transacciones por día
    const numTransactions = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numTransactions; i++) {
      const isIncome = Math.random() < 0.2; // 20% de probabilidad de ser ingreso
      const categories = isIncome ? incomeCategories : expenseCategories;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      
      let amount, description;
      if (isIncome) {
        amount = Math.floor(Math.random() * 2000) + 500; // $500-2500
        description = `Ingreso ${transactionCounter}`;
      } else {
        amount = -(Math.floor(Math.random() * 300) + 20); // -$20 to -$320
        description = `Gasto ${transactionCounter}`;
      }
      
      const transactionId = `generated-${transactionCounter}`;
      const type = isIncome ? 'income' : 'expense';
      const tags = '["generated","test"]';
      const location = Math.random() < 0.5 ? 'Location ' + transactionCounter : null;
      
      try {
        insertTransaction.run(
          transactionId,
          account,
          category,
          amount,
          description,
          dateStr,
          type,
          tags,
          location,
          0,
          null
        );
        transactionCounter++;
      } catch (error) {
        // Ignorar errores de duplicados
      }
    }
  }
  
  console.log(`Generadas ${transactionCounter - 1000} transacciones adicionales`);
}

// Función para generar más metas y presupuestos
function generateAdditionalGoalsAndBudgets() {
  console.log('Generando metas y presupuestos adicionales...');
  
  // Insertar más metas
  const insertGoal = db.prepare(`
    INSERT OR IGNORE INTO goals (id, title, description, target_amount, current_amount, target_date, category, priority, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const additionalGoals = [
    ['goal-smartphone', 'Nuevo Smartphone', 'Ahorrar para iPhone 15 Pro', 1200.00, 400.00, '2024-11-30', 'technology', 'medium', 'USD'],
    ['goal-furniture', 'Muebles para Casa', 'Renovar muebles del living', 3000.00, 850.00, '2024-10-15', 'home', 'low', 'USD'],
    ['goal-education', 'Curso de Programación', 'Bootcamp de desarrollo web', 4000.00, 1500.00, '2024-09-30', 'education', 'high', 'USD'],
    ['goal-wedding', 'Fondo para Boda', 'Ahorros para la boda', 15000.00, 6500.00, '2025-05-20', 'personal', 'high', 'USD'],
    ['goal-retirement', 'Jubilación Anticipada', 'Fondo de retiro temprano', 100000.00, 12000.00, '2030-12-31', 'retirement', 'high', 'USD']
  ];

  additionalGoals.forEach(goal => {
    try {
      insertGoal.run(...goal);
    } catch (error) {
      // Ignorar duplicados
    }
  });

  // Insertar más presupuestos
  const insertBudget = db.prepare(`
    INSERT OR IGNORE INTO budgets (id, category_id, amount, period, start_date, currency, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const additionalBudgets = [
    ['budget-travel', 'cat-6', 800.00, 'monthly', '2024-01-01', 'USD', 0.8],
    ['budget-education', 'cat-7', 300.00, 'monthly', '2024-01-01', 'USD', 0.7],
    ['budget-investment', 'cat-13', 1000.00, 'monthly', '2024-01-01', 'USD', 0.9],
    ['budget-misc', 'cat-14', 200.00, 'monthly', '2024-01-01', 'USD', 0.8]
  ];

  additionalBudgets.forEach(budget => {
    try {
      insertBudget.run(...budget);
    } catch (error) {
      // Ignorar duplicados
    }
  });

  console.log('Metas y presupuestos adicionales generados');
}

// Función para mostrar estadísticas finales
function showFinalStats() {
  console.log('\n=== ESTADÍSTICAS FINALES ===');
  
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
  
  // Mostrar estadísticas de transacciones por mes
  const monthlyStats = db.prepare(`
    SELECT strftime('%Y-%m', date) as month, 
           COUNT(*) as count,
           SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
           SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
    FROM transactions 
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
    LIMIT 6
  `).all();
  
  console.log('\n📈 ESTADÍSTICAS MENSUALES:');
  monthlyStats.forEach(stat => {
    console.log(`${stat.month}: ${stat.count} transacciones, Ingresos: $${stat.total_income.toFixed(2)}, Gastos: $${stat.total_expenses.toFixed(2)}`);
  });
}

// Ejecutar generación masiva de datos
console.log('🚀 Iniciando generación masiva de datos de prueba...');
try {
  generateMassiveTestData();
  generateAdditionalGoalsAndBudgets();
  showFinalStats();
  console.log('\n✅ Generación masiva completada exitosamente!');
} catch (error) {
  console.error('❌ Error durante la generación:', error);
  process.exit(1);
} finally {
  db.close();
}
