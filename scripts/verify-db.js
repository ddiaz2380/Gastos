const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(process.cwd(), 'finance.db');
  const db = new Database(dbPath);
  
  console.log('=== Verificación de Base de Datos ===');
  console.log('Ubicación:', dbPath);
  
  // Verificar tablas
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tablas encontradas:', tables.map(t => t.name));
  
  // Contar registros
  try {
    const accounts = db.prepare('SELECT COUNT(*) as count FROM accounts').get();
    console.log('Cuentas:', accounts.count);
  } catch (e) {
    console.log('Error en tabla accounts:', e.message);
  }
  
  try {
    const categories = db.prepare('SELECT COUNT(*) as count FROM categories').get();
    console.log('Categorías:', categories.count);
  } catch (e) {
    console.log('Error en tabla categories:', e.message);
  }
  
  try {
    const transactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    console.log('Transacciones:', transactions.count);
  } catch (e) {
    console.log('Error en tabla transactions:', e.message);
  }
  
  db.close();
  console.log('✅ Verificación completada');
  
} catch (error) {
  console.error('❌ Error verificando base de datos:', error.message);
}
