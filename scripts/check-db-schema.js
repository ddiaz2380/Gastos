const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'finance.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  
  console.log('Connected to SQLite database.');
  
  // Get all table schemas
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error('Error getting tables:', err.message);
      return;
    }
    
    console.log('\nTables in database:');
    rows.forEach(row => {
      console.log(`- ${row.name}`);
    });
    
    // Check the transactions table schema specifically
    db.all("PRAGMA table_info(transactions)", [], (err, columns) => {
      if (err) {
        console.error('Error getting transactions schema:', err.message);
      } else {
        console.log('\nTransactions table columns:');
        columns.forEach(col => {
          console.log(`  ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - Default: ${col.dflt_value || 'None'}`);
        });
      }
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('\nDatabase connection closed.');
        }
      });
    });
  });
});
