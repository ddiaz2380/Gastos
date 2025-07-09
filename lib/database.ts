import Database from 'better-sqlite3';
import path from 'path';
import { CURRENCIES, type CurrencyCode } from './currency-client';

// Crear la base de datos SQLite
const dbPath = path.join(process.cwd(), 'finance.db');
const db = new Database(dbPath);

// Habilitar claves foráneas
db.pragma('foreign_keys = ON');

// Re-exportar para compatibilidad
export { CURRENCIES, type CurrencyCode } from './currency-client';

// Crear tablas
const createTables = () => {
  // Tabla de cuentas
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) >= 2),
      type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'cash', 'investment')),
      balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de categorías
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) >= 2),
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      color TEXT CHECK (color LIKE '#%' AND length(color) = 7),
      icon TEXT,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de transacciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount != 0),
      description TEXT CHECK (length(description) >= 3 OR description IS NULL),
      date DATE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      tags TEXT, -- JSON array as string
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_frequency IS NULL),
      location TEXT,
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )
  `);

  // Tabla de presupuestos
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount > 0),
      period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
      start_date DATE NOT NULL,
      end_date DATE,
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      alert_threshold REAL DEFAULT 0.8 CHECK (alert_threshold BETWEEN 0 AND 1),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);

  // Tabla de metas financieras
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(title) >= 3),
      description TEXT,
      target_amount REAL NOT NULL CHECK (target_amount > 0),
      current_amount REAL DEFAULT 0 CHECK (current_amount >= 0),
      target_date DATE,
      category TEXT,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de pagos/facturas
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) >= 3),
      amount REAL NOT NULL CHECK (amount > 0),
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
      category TEXT,
      description TEXT,
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly') OR recurring_frequency IS NULL),
      account_id TEXT,
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      paid_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    )
  `);
};

// Función para insertar datos de ejemplo
const insertSampleData = () => {
  // Verificar si ya hay datos
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number };
  if (accountCount.count > 0) {
    return; // Ya hay datos, no insertar duplicados
  }

  // Insertar cuentas de ejemplo
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, type, balance, currency, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAccount.run('acc-1', 'Cuenta Corriente Banco Nación', 'checking', 485200.50, 'ARS', 'Cuenta sueldo principal');
  insertAccount.run('acc-2', 'Caja de Ahorro USD', 'savings', 2850.00, 'USD', 'Ahorros en dólares');
  insertAccount.run('acc-3', 'Tarjeta Visa', 'credit', -125000.75, 'ARS', 'Tarjeta de crédito principal');
  insertAccount.run('acc-4', 'Efectivo', 'cash', 45000.00, 'ARS', 'Dinero en efectivo');
  insertAccount.run('acc-5', 'Cuenta EUR', 'savings', 1200.00, 'EUR', 'Ahorros en euros');

  // Insertar categorías de ejemplo
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, type, color, icon, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Categorías de gastos
  insertCategory.run('cat-1', 'Supermercado y Almacén', 'expense', '#ef4444', '🛒', 'Compras de comida y productos del hogar');
  insertCategory.run('cat-2', 'Transporte Público', 'expense', '#3b82f6', '🚌', 'Colectivo, subte, tren y taxi');
  insertCategory.run('cat-3', 'Entretenimiento', 'expense', '#8b5cf6', '🎬', 'Cine, teatro, salidas y diversión');
  insertCategory.run('cat-4', 'Servicios del Hogar', 'expense', '#f59e0b', '💡', 'Luz, gas, agua, internet y teléfono');
  insertCategory.run('cat-5', 'Salud y Farmacia', 'expense', '#10b981', '🏥', 'Medicamentos, consultas médicas y obra social');
  insertCategory.run('cat-6', 'Ropa y Calzado', 'expense', '#ec4899', '👕', 'Vestimenta y accesorios');
  insertCategory.run('cat-7', 'Educación', 'expense', '#6366f1', '📚', 'Cursos, libros y materiales de estudio');
  insertCategory.run('cat-8', 'Combustible', 'expense', '#dc2626', '⛽', 'Nafta y gasóleo');
  insertCategory.run('cat-9', 'Restaurantes', 'expense', '#f97316', '🍕', 'Comidas fuera de casa');
  insertCategory.run('cat-10', 'Impuestos', 'expense', '#64748b', '🏛️', 'Impuestos municipales, provinciales y nacionales');
  
  // Categorías de ingresos
  insertCategory.run('cat-11', 'Sueldo', 'income', '#22c55e', '💼', 'Salario mensual en relación de dependencia');
  insertCategory.run('cat-12', 'Trabajos Freelance', 'income', '#06b6d4', '💻', 'Ingresos por trabajos independientes');
  insertCategory.run('cat-13', 'Inversiones', 'income', '#84cc16', '📈', 'Rendimientos de plazo fijo, bonos y acciones');
  insertCategory.run('cat-14', 'Venta de Productos', 'income', '#8b5cf6', '🛍️', 'Ingresos por ventas ocasionales');
  insertCategory.run('cat-15', 'Aguinaldo', 'income', '#059669', '🎁', 'Sueldo anual complementario');

  // Insertar transacciones de ejemplo
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, account_id, category_id, amount, description, date, type, tags, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Ingresos
  insertTransaction.run('txn-1', 'acc-1', 'cat-11', 450000.00, 'Sueldo enero 2024', '2024-01-01', 'income', JSON.stringify(['trabajo', 'mensual']), 'Oficina');
  insertTransaction.run('txn-2', 'acc-1', 'cat-12', 85000.00, 'Desarrollo web freelance', '2024-01-15', 'income', JSON.stringify(['freelance', 'programacion']), 'Home office');
  insertTransaction.run('txn-3', 'acc-2', 'cat-13', 125.00, 'Intereses plazo fijo USD', '2024-01-20', 'income', JSON.stringify(['inversion', 'interes']), 'Banco');
  
  // Gastos del hogar
  insertTransaction.run('txn-4', 'acc-1', 'cat-1', -45000.00, 'Compras mensuales Carrefour', '2024-01-02', 'expense', JSON.stringify(['supermercado', 'mensual']), 'Carrefour Palermo');
  insertTransaction.run('txn-5', 'acc-1', 'cat-1', -18500.00, 'Verdulería y carnicería', '2024-01-08', 'expense', JSON.stringify(['verduras', 'carne']), 'Mercado San Telmo');
  insertTransaction.run('txn-6', 'acc-4', 'cat-1', -8200.00, 'Panadería', '2024-01-10', 'expense', JSON.stringify(['pan', 'facturas']), 'Panadería del barrio');
  
  // Servicios
  insertTransaction.run('txn-7', 'acc-1', 'cat-4', -12500.00, 'Factura de luz EDESUR', '2024-01-05', 'expense', JSON.stringify(['luz', 'servicio']), null);
  insertTransaction.run('txn-8', 'acc-1', 'cat-4', -8900.00, 'Internet Fibertel', '2024-01-03', 'expense', JSON.stringify(['internet', 'mensual']), null);
  insertTransaction.run('txn-9', 'acc-1', 'cat-4', -6500.00, 'Gas Natural', '2024-01-12', 'expense', JSON.stringify(['gas', 'calefaccion']), null);
  
  // Transporte
  insertTransaction.run('txn-10', 'acc-1', 'cat-2', -15000.00, 'Carga SUBE mensual', '2024-01-01', 'expense', JSON.stringify(['sube', 'transporte']), 'Estación Retiro');
  insertTransaction.run('txn-11', 'acc-4', 'cat-8', -25000.00, 'Nafta YPF', '2024-01-14', 'expense', JSON.stringify(['nafta', 'auto']), 'YPF Av. Corrientes');
  
  // Entretenimiento
  insertTransaction.run('txn-12', 'acc-3', 'cat-3', -4500.00, 'Netflix mensual', '2024-01-05', 'expense', JSON.stringify(['streaming', 'entretenimiento']), null);
  insertTransaction.run('txn-13', 'acc-4', 'cat-9', -12000.00, 'Cena en Puerto Madero', '2024-01-18', 'expense', JSON.stringify(['restaurante', 'cena']), 'Puerto Madero');
  insertTransaction.run('txn-14', 'acc-4', 'cat-3', -8500.00, 'Cine Hoyts', '2024-01-22', 'expense', JSON.stringify(['cine', 'pelicula']), 'Hoyts Abasto');
  
  // Salud
  insertTransaction.run('txn-15', 'acc-1', 'cat-5', -15000.00, 'Consulta médica particular', '2024-01-25', 'expense', JSON.stringify(['medico', 'consulta']), 'Consultorio Recoleta');
  insertTransaction.run('txn-16', 'acc-4', 'cat-5', -3200.00, 'Farmacia medicamentos', '2024-01-26', 'expense', JSON.stringify(['farmacia', 'medicamentos']), 'Farmacity');

  // Insertar presupuestos de ejemplo
  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, category_id, amount, period, start_date, currency, alert_threshold)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertBudget.run('bud-1', 'cat-1', 80000.00, 'monthly', '2024-01-01', 'ARS', 0.8);
  insertBudget.run('bud-2', 'cat-2', 35000.00, 'monthly', '2024-01-01', 'ARS', 0.9);
  insertBudget.run('bud-3', 'cat-3', 25000.00, 'monthly', '2024-01-01', 'ARS', 0.7);
  insertBudget.run('bud-4', 'cat-4', 45000.00, 'monthly', '2024-01-01', 'ARS', 0.8);
  insertBudget.run('bud-5', 'cat-9', 30000.00, 'monthly', '2024-01-01', 'ARS', 0.8);
  insertBudget.run('bud-6', 'cat-8', 40000.00, 'monthly', '2024-01-01', 'ARS', 0.9);

  // Insertar metas de ejemplo
  const insertGoal = db.prepare(`
    INSERT INTO goals (id, title, description, target_amount, current_amount, target_date, category, priority, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertGoal.run('goal-1', 'Fondo de Emergencia', 'Ahorrar 6 meses de gastos para imprevistos', 2700000.00, 850000.00, '2024-12-31', 'emergency', 'high', 'ARS');
  insertGoal.run('goal-2', 'Vacaciones en Bariloche', 'Viaje familiar a Bariloche en invierno', 800000.00, 320000.00, '2024-07-15', 'travel', 'medium', 'ARS');
  insertGoal.run('goal-3', 'Auto 0km', 'Anticipo para auto nuevo', 3500000.00, 1200000.00, '2025-03-30', 'vehicle', 'medium', 'ARS');
  insertGoal.run('goal-4', 'Curso de Inglés', 'Curso intensivo de inglés en instituto', 180000.00, 45000.00, '2024-06-01', 'education', 'low', 'ARS');
  insertGoal.run('goal-5', 'Ahorros en USD', 'Meta de ahorro en dólares', 5000.00, 1200.00, '2024-12-31', 'savings', 'high', 'USD');

  // Insertar pagos de ejemplo
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, name, amount, due_date, status, category, description, account_id, currency, is_recurring, recurring_frequency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayment.run('pay-1', 'Alquiler Departamento', 180000.00, '2024-02-10', 'pending', 'vivienda', 'Alquiler mensual 2 ambientes Palermo', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-2', 'Expensas Consorcio', 45000.00, '2024-02-10', 'pending', 'vivienda', 'Expensas ordinarias del edificio', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-3', 'OSDE Plan 210', 28500.00, '2024-02-05', 'paid', 'salud', 'Obra social familiar', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-4', 'Seguro Auto Zurich', 18000.00, '2024-02-20', 'pending', 'seguro', 'Seguro todo riesgo Corolla', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-5', 'Cuota Gimnasio', 12000.00, '2024-02-15', 'pending', 'salud', 'Megatlon mensual', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-6', 'Tarjeta Visa', 85000.00, '2024-02-25', 'pending', 'credito', 'Pago mínimo tarjeta de crédito', 'acc-1', 'ARS', false, null);
  insertPayment.run('pay-7', 'ABL CABA', 8500.00, '2024-02-28', 'pending', 'impuestos', 'Alumbrado, Barrido y Limpieza', 'acc-1', 'ARS', true, 'monthly');
  insertPayment.run('pay-8', 'Spotify Premium', 1200.00, '2024-02-12', 'paid', 'entretenimiento', 'Suscripción música streaming', 'acc-1', 'ARS', true, 'monthly');
};

// Inicializar la base de datos
export const initializeDatabase = () => {
  try {
    console.log('Initializing database...');
    createTables();
    insertSampleData();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Verificar si la base de datos está inicializada
const isDbInitialized = () => {
  try {
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='accounts'").get();
    return result !== undefined;
  } catch {
    return false;
  }
};

// Inicializar la base de datos automáticamente si no está inicializada
if (!isDbInitialized()) {
  try {
    initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Exportar la instancia de la base de datos
export default db;

// Funciones de utilidad para consultas comunes
export const dbQueries = {
  // Cuentas
  getAllAccounts: db.prepare('SELECT * FROM accounts WHERE is_active = TRUE ORDER BY name'),
  getAccountById: db.prepare('SELECT * FROM accounts WHERE id = ?'),
  getAccountsByType: db.prepare('SELECT * FROM accounts WHERE type = ? AND is_active = TRUE ORDER BY name'),
  getAccountsByCurrency: db.prepare('SELECT * FROM accounts WHERE currency = ? AND is_active = TRUE ORDER BY name'),
  
  // Categorías
  getAllCategories: db.prepare('SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'),
  getCategoriesByType: db.prepare('SELECT * FROM categories WHERE type = ? AND is_active = TRUE ORDER BY name'),
  getCategoryById: db.prepare('SELECT * FROM categories WHERE id = ?'),
  
  // Transacciones
  getAllTransactions: db.prepare(`
    SELECT t.*, a.name as account_name, a.currency as account_currency, 
           c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN categories c ON t.category_id = c.id
    ORDER BY t.date DESC, t.created_at DESC
  `),
  
  getTransactionsByDateRange: db.prepare(`
    SELECT t.*, a.name as account_name, a.currency as account_currency,
           c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.date BETWEEN ? AND ?
    ORDER BY t.date DESC, t.created_at DESC
  `),
  
  getTransactionsByAccount: db.prepare(`
    SELECT t.*, a.name as account_name, a.currency as account_currency,
           c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.account_id = ?
    ORDER BY t.date DESC, t.created_at DESC
  `),
  
  getTransactionsByCategory: db.prepare(`
    SELECT t.*, a.name as account_name, a.currency as account_currency,
           c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN categories c ON t.category_id = c.id
    WHERE t.category_id = ?
    ORDER BY t.date DESC, t.created_at DESC
  `),
  
  // Presupuestos
  getAllBudgets: db.prepare(`
    SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.is_active = TRUE
    ORDER BY b.created_at DESC
  `),
  
  getBudgetById: db.prepare(`
    SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.id = ?
  `),
  
  getBudgetsByCurrency: db.prepare(`
    SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    WHERE b.currency = ? AND b.is_active = TRUE
    ORDER BY b.created_at DESC
  `),
  
  // Metas
  getAllGoals: db.prepare('SELECT * FROM goals WHERE status != \'cancelled\' ORDER BY priority DESC, target_date ASC'),
  getGoalById: db.prepare('SELECT * FROM goals WHERE id = ?'),
  getGoalsByStatus: db.prepare('SELECT * FROM goals WHERE status = ? ORDER BY priority DESC, target_date ASC'),
  getGoalsByCurrency: db.prepare('SELECT * FROM goals WHERE currency = ? AND status != \'cancelled\' ORDER BY priority DESC, target_date ASC'),
  
  // Pagos
  getAllPayments: db.prepare('SELECT * FROM payments ORDER BY due_date ASC'),
  getPaymentById: db.prepare('SELECT * FROM payments WHERE id = ?'),
  getPendingPayments: db.prepare('SELECT * FROM payments WHERE status = \'pending\' ORDER BY due_date ASC'),
  getOverduePayments: db.prepare('SELECT * FROM payments WHERE status = \'overdue\' ORDER BY due_date ASC'),
  getPaymentsByStatus: db.prepare('SELECT * FROM payments WHERE status = ? ORDER BY due_date ASC'),
  getPaymentsByCurrency: db.prepare('SELECT * FROM payments WHERE currency = ? ORDER BY due_date ASC'),
  getRecurringPayments: db.prepare('SELECT * FROM payments WHERE is_recurring = TRUE ORDER BY due_date ASC'),
  
  // Estadísticas y reportes
  getMonthlyExpensesByCategory: db.prepare(`
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
  `),
  
  getMonthlyIncomeByCategory: db.prepare(`
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
  `),
  
  getDailyExpensesThisMonth: db.prepare(`
    SELECT DATE(t.date) as date, SUM(ABS(t.amount)) as total_amount, a.currency
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    WHERE t.type = 'expense' 
      AND t.date >= date('now', 'start of month')
      AND t.date < date('now', 'start of month', '+1 month')
    GROUP BY DATE(t.date), a.currency
    ORDER BY date ASC
  `),
  
  getAccountBalancesByCurrency: db.prepare(`
    SELECT currency, SUM(balance) as total_balance, COUNT(*) as account_count
    FROM accounts 
    WHERE is_active = TRUE
    GROUP BY currency
    ORDER BY currency
  `)
};