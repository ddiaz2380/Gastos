const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');

const db = new Database('finance.db');

console.log('Creando presupuestos de ejemplo...');

// Primero, obtener algunas categorías de gasto
const categories = db.prepare('SELECT * FROM categories WHERE type = ? AND is_active = TRUE LIMIT 5').all('expense');

if (categories.length === 0) {
  console.log('No hay categorías de gasto disponibles. Creando algunas...');
  
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, type, color, icon, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const newCategories = [
    { id: uuidv4(), name: 'Alimentación', type: 'expense', color: '#ef4444', icon: '🍕', description: 'Comida y bebidas' },
    { id: uuidv4(), name: 'Transporte', type: 'expense', color: '#3b82f6', icon: '🚗', description: 'Transporte público y combustible' },
    { id: uuidv4(), name: 'Entretenimiento', type: 'expense', color: '#8b5cf6', icon: '🎬', description: 'Cine, teatro, actividades' },
    { id: uuidv4(), name: 'Servicios', type: 'expense', color: '#f59e0b', icon: '⚡', description: 'Luz, gas, internet' },
    { id: uuidv4(), name: 'Salud', type: 'expense', color: '#10b981', icon: '🏥', description: 'Medicina y consultas' }
  ];
  
  newCategories.forEach(cat => {
    insertCategory.run(cat.id, cat.name, cat.type, cat.color, cat.icon, cat.description);
  });
  
  categories.push(...newCategories);
  console.log('✓ Categorías creadas');
}

// Crear presupuestos de ejemplo
const insertBudget = db.prepare(`
  INSERT INTO budgets (id, category_id, amount, currency, start_date, end_date, alert_threshold, description, period, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const budgets = [
  {
    id: uuidv4(),
    category_id: categories[0].id,
    amount: 50000,
    currency: 'ARS',
    start_date: '2025-07-01',
    end_date: '2025-07-31',
    alert_threshold: 0.8,
    description: 'Presupuesto mensual para alimentación',
    period: 'monthly'
  },
  {
    id: uuidv4(),
    category_id: categories[1].id,
    amount: 25000,
    currency: 'ARS',
    start_date: '2025-07-01',
    end_date: '2025-07-31',
    alert_threshold: 0.75,
    description: 'Transporte mensual',
    period: 'monthly'
  },
  {
    id: uuidv4(),
    category_id: categories[2].id,
    amount: 300,
    currency: 'USD',
    start_date: '2025-07-01',
    end_date: '2025-12-31',
    alert_threshold: 0.9,
    description: 'Entretenimiento semestral',
    period: 'yearly'
  }
];

try {
  budgets.forEach(budget => {
    insertBudget.run(
      budget.id,
      budget.category_id,
      budget.amount,
      budget.currency,
      budget.start_date,
      budget.end_date,
      budget.alert_threshold,
      budget.description,
      budget.period
    );
  });
  
  console.log('✓ Presupuestos creados exitosamente');
  
  // Verificar que se crearon
  const count = db.prepare('SELECT COUNT(*) as total FROM budgets').get();
  console.log(`Total de presupuestos en la base de datos: ${count.total}`);
  
} catch (error) {
  console.error('Error creando presupuestos:', error.message);
}

db.close();
console.log('✓ Base de datos cerrada');
