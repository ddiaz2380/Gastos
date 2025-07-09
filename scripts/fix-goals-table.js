const Database = require('better-sqlite3');
const db = new Database('finance.db');

// Add the missing status column to the goals table
try {
  db.exec("ALTER TABLE goals ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled'));");
  console.log('✓ Added status column to goals table');
} catch (error) {
  console.error('Error adding status column:', error.message);
}

// Verify the column was added
const goalsSchema = db.prepare('PRAGMA table_info(goals)').all();
console.log('Goals table schema after update:');
goalsSchema.forEach(col => {
  console.log(`  ${col.name}: ${col.type} (${col.notnull ? 'NOT NULL' : 'NULL'})`);
});

db.close();
