const path = require('path');
const Database = require('better-sqlite3');

// Recreate the database path
const dbPath = path.join(__dirname, '..', 'finance.db');
console.log('Database path:', dbPath);

// Create database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables function
function createTables() {
  console.log('Creating tables...');
  
  // Accounts table
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

  // Categories table
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

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK (amount != 0),
      description TEXT CHECK (length(description) >= 3 OR description IS NULL),
      date DATE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      tags TEXT,
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

  // Budgets table
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

  // Goals table
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
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK (length(name) >= 2),
      amount REAL NOT NULL CHECK (amount > 0),
      due_date DATE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
      category TEXT,
      description TEXT,
      account_id TEXT,
      currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD', 'EUR')),
      is_recurring BOOLEAN DEFAULT FALSE,
      recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_frequency IS NULL),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    )
  `);

  console.log('Tables created successfully!');
}

// Insert sample data function
function insertSampleData() {
  console.log('Inserting sample data...');
  
  // Check if data already exists
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
  if (accountCount.count > 0) {
    console.log('Sample data already exists, skipping insertion');
    return;
  }

  // Insert accounts
  const insertAccount = db.prepare(`
    INSERT INTO accounts (id, name, type, balance, currency, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertAccount.run('acc-1', 'Cuenta Corriente Banco Nación', 'checking', 485200.50, 'ARS', 'Cuenta sueldo principal');
  insertAccount.run('acc-2', 'Caja de Ahorro USD', 'savings', 2850.00, 'USD', 'Ahorros en dólares');
  insertAccount.run('acc-3', 'Tarjeta Visa', 'credit', -125000.75, 'ARS', 'Tarjeta de crédito principal');
  insertAccount.run('acc-4', 'Efectivo', 'cash', 45000.00, 'ARS', 'Dinero en efectivo');
  insertAccount.run('acc-5', 'Cuenta EUR', 'savings', 1200.00, 'EUR', 'Ahorros en euros');

  // Insert categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, type, color, icon, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Expense categories
  insertCategory.run('cat-1', 'Supermercado y Almacén', 'expense', '#ef4444', '🛒', 'Compras de comida y productos del hogar');
  insertCategory.run('cat-2', 'Transporte Público', 'expense', '#3b82f6', '🚌', 'Colectivo, subte, tren y taxi');
  insertCategory.run('cat-3', 'Entretenimiento', 'expense', '#8b5cf6', '🎬', 'Cine, teatro, salidas y diversión');
  insertCategory.run('cat-4', 'Servicios del Hogar', 'expense', '#f59e0b', '💡', 'Luz, gas, agua, internet y teléfono');
  insertCategory.run('cat-5', 'Salud y Farmacia', 'expense', '#10b981', '🏥', 'Medicamentos, consultas médicas y obra social');
  
  // Income categories
  insertCategory.run('cat-11', 'Sueldo', 'income', '#22c55e', '💼', 'Salario mensual en relación de dependencia');
  insertCategory.run('cat-12', 'Trabajos Freelance', 'income', '#06b6d4', '💻', 'Ingresos por trabajos independientes');
  insertCategory.run('cat-13', 'Inversiones', 'income', '#84cc16', '📈', 'Rendimientos de plazo fijo, bonos y acciones');

  // Insert transactions
  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, account_id, category_id, amount, description, date, type, tags, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Income transactions
  insertTransaction.run('txn-1', 'acc-1', 'cat-11', 450000.00, 'Sueldo enero 2024', '2024-01-01', 'income', JSON.stringify(['trabajo', 'mensual']), 'Oficina');
  insertTransaction.run('txn-2', 'acc-1', 'cat-12', 85000.00, 'Desarrollo web freelance', '2024-01-15', 'income', JSON.stringify(['freelance', 'programacion']), 'Home office');
  
  // Expense transactions
  insertTransaction.run('txn-4', 'acc-1', 'cat-1', -45000.00, 'Compras mensuales Carrefour', '2024-01-02', 'expense', JSON.stringify(['supermercado', 'mensual']), 'Carrefour Palermo');
  insertTransaction.run('txn-5', 'acc-1', 'cat-2', -15000.00, 'Carga SUBE mensual', '2024-01-01', 'expense', JSON.stringify(['sube', 'transporte']), 'Estación Retiro');
  insertTransaction.run('txn-6', 'acc-1', 'cat-4', -12500.00, 'Factura de luz EDESUR', '2024-01-05', 'expense', JSON.stringify(['luz', 'servicio']), null);

  console.log('Sample data inserted successfully!');
}

// Initialize database
console.log('Initializing database...');
try {
  createTables();
  insertSampleData();
  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
} finally {
  db.close();
}
