const sqlite3 = require("sqlite3").verbose();

// Create DB file (if not exists)
const db = new sqlite3.Database("./login.db", (err) => {
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

module.exports = db;
