const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'finance.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to the SQLite database.');
});

// Create transfers table
const createTransfersTable = `
  CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    from_account_id TEXT NOT NULL,
    to_account_id TEXT NOT NULL,
    amount REAL NOT NULL,
    fee REAL DEFAULT 0,
    description TEXT,
    transfer_type TEXT NOT NULL CHECK (transfer_type IN ('internal', 'external')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    scheduled_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    FOREIGN KEY (from_account_id) REFERENCES accounts (id),
    FOREIGN KEY (to_account_id) REFERENCES accounts (id)
  )
`;

db.run(createTransfersTable, (err) => {
  if (err) {
    console.error('Error creating transfers table:', err.message);
    db.close();
    return;
  } else {
    console.log('Transfers table created successfully.');
    
    // Create indexes for better performance after table is created
    const createIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_transfers_from_account ON transfers(from_account_id)',
      'CREATE INDEX IF NOT EXISTS idx_transfers_to_account ON transfers(to_account_id)',
      'CREATE INDEX IF NOT EXISTS idx_transfers_created_at ON transfers(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status)'
    ];

    let indexesCreated = 0;
    createIndexes.forEach((indexQuery, index) => {
      db.run(indexQuery, (err) => {
        if (err) {
          console.error(`Error creating index ${index + 1}:`, err.message);
        } else {
          console.log(`Index ${index + 1} created successfully.`);
        }
        
        indexesCreated++;
        if (indexesCreated === createIndexes.length) {
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('Database connection closed.');
            }
          });
        }
      });
    });
  }
});

// Database will be closed after indexes are created