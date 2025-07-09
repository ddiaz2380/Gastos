const Database = require('better-sqlite3');
const db = new Database('finance.db');

console.log('Tables:', db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
console.log('Transactions schema:', db.prepare('PRAGMA table_info(transactions)').all());

// Test a simple query
try {
  const result = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
  console.log('Transaction count:', result.count);
} catch (error) {
  console.error('Error querying transactions:', error.message);
}

db.close();
