const express = require("express");
const db = require("./db"); // your SQLite connection
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Automatically add default admin on server start
const defaultAdmin = {
  email: "admin@example.com",
  password: "admin123",
};

// Check if admin exists; if not, create it
db.get("SELECT * FROM users WHERE email = ?", [defaultAdmin.email], (err, row) => {
  if (err) {
    console.error("Error checking admin:", err.message);
  } else if (!row) {
    db.run(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [defaultAdmin.email, defaultAdmin.password],
      function (err) {
        if (err) console.error("Error adding admin:", err.message);
        else console.log(`Default admin added: ${defaultAdmin.email} / ${defaultAdmin.password}`);
      }
    );
  } else {
    console.log("Admin already exists in the database.");
  }
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.get(query, [email, password], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!row) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
