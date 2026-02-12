const sqlite3 = require("sqlite3").verbose();

// Create DB file (if not exists)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// Create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timeUTC TEXT NOT NULL,
    initials TEXT NOT NULL,
    remarks TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    images TEXT DEFAULT '[]'
  )
`);

// Add images column if it doesn't exist (for existing databases)
db.run(`ALTER TABLE logs ADD COLUMN images TEXT DEFAULT '[]'`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('Error adding images column:', err.message);
  }
});

module.exports = db;
