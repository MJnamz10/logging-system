const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* =========================
   DEFAULT ADMIN
========================= */
const defaultAdmin = {
  email: "admin@example.com",
  password: "admin123",
};

db.get(
  "SELECT * FROM users WHERE email = ?",
  [defaultAdmin.email],
  (err, row) => {
    if (err) {
      console.error("Error checking admin:", err.message);
    } else if (!row) {
      db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [defaultAdmin.email, defaultAdmin.password],
        (err) => {
          if (err) console.error("Error adding admin:", err.message);
          else console.log("Default admin created");
        }
      );
    }
  }
);

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.get(sql, [email, password], (err, row) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!row) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful" });
  });
});

/* =========================
   ADD LOG ENTRY
========================= */
app.post("/logs", (req, res) => {
  const { facility, initials, remarks } = req.body;
  const timestamp = new Date().toISOString();

  if (!facility || !initials || !remarks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO logs (facility, initials, remarks, timestamp)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [facility, initials, remarks, timestamp], function (err) {
    if (err) {
      console.error("Error inserting log:", err.message);
      return res.status(500).json({ message: "Failed to save log entry" });
    }

    res.json({
      id: this.lastID,
      facility,
      initials,
      remarks,
      timestamp,
    });
  });
});

/* =========================
   GET LATEST LOG ENTRY
========================= */
app.get("/logs/latest", (req, res) => {
  const sql = `
    SELECT *
    FROM logs
    ORDER BY timestamp DESC
    LIMIT 1
  `;

  db.get(sql, [], (err, row) => {
    if (err) {
      console.error("Error fetching latest log:", err.message);
      return res.status(500).json({ message: "Failed to fetch latest log" });
    }

    // If no logs yet
    if (!row) {
      return res.json(null);
    }

    res.json(row);
  });
});


app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
