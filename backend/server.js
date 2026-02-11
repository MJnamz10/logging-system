const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
console.log("🔥 RUNNING THIS server.js FILE");

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
        },
      );
    }
  },
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
   FETCH ALL LOGS
========================= */
app.get("/logs", (req, res) => {
  const sql = "SELECT * FROM logs ORDER BY timestamp DESC";

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all logs:", err.message);
      return res.status(500).json({ message: "Failed to fetch logs" });
    }
    // This sends all stored data back to your React app
    res.json(rows);
  });
});
/* =========================
   ADD LOG ENTRY
========================= */
app.post("/logs", (req, res) => {
  const { timeUTC, initials, remarks } = req.body;
  const timestamp = new Date().toISOString();

  if (!timeUTC || !initials || !remarks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = `
    INSERT INTO logs (timeUTC, initials, remarks, timestamp)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [timeUTC, initials, remarks, timestamp], function (err) {
    if (err) {
      console.error("Error inserting log:", err.message);
      return res.status(500).json({ message: "Failed to save log entry" });
    }

    res.json({
      id: this.lastID,
      timeUTC,
      initials,
      remarks,
      timestamp,
    });
  });
});

/* =========================
   EXPORT LOGS AS PDF
   GET /logs/export/pdf
========================= */
app.get("/logs/export/pdf", (req, res) => {
  // OPTIONAL filters:
  // ?facility=Tower
  // ?from=2026-02-01&to=2026-02-10
  const { facility, from, to } = req.query;

  let sql = `SELECT * FROM logs`;
  const params = [];
  const where = [];

  if (facility) {
    where.push(`facility = ?`);
    params.push(facility);
  }
  if (from) {
    where.push(`date(timestamp) >= date(?)`);
    params.push(from);
  }
  if (to) {
    where.push(`date(timestamp) <= date(?)`);
    params.push(to);
  }

  if (where.length) sql += ` WHERE ` + where.join(" AND ");
  sql += ` ORDER BY timestamp ASC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching logs for PDF:", err.message);
      return res.status(500).json({ message: "Failed to export logs" });
    }

    // Tell browser it's a PDF download/preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="daily-maintenance-log.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 36 });
    doc.pipe(res);

    // ====== Helpers ======
    const PAGE_W = 595;
    const left = 20;
    const right = PAGE_W - 20;

    const pageTop = 30;

    const drawHLine = (y, w = 0.8) => {
      doc.save();
      doc.lineWidth(w);
      doc.moveTo(left, y).lineTo(right, y).stroke();
      doc.restore();
    };

    const drawVLine = (x, y1, y2, w = 0.8) => {
      doc.save();
      doc.lineWidth(w);
      doc.moveTo(x, y1).lineTo(x, y2).stroke();
      doc.restore();
    };

    // ====== Header ======
    doc.font("Helvetica").fontSize(9);
    doc.text("Republic of the Philippines", left, pageTop, {
      align: "center",
      width: right - left,
    });
    doc.text("Department of Transportation and Communications", {
      align: "center",
    });

    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("CIVIL AVIATION AUTHORITY OF THE PHILIPPINES", {
      align: "center",
    });
    doc.text("AIR NAVIGATION SERVICE", { align: "center" });

    doc.moveDown(1);

    // ====== Facility / Month-Year lines ======
    let y = doc.y + 8;
    const lineGap = 6;
    doc.font("Helvetica").fontSize(9);
    doc.text("FACILITY:", left, y);
    doc
      .moveTo(left + 41, y + lineGap)
      .lineTo(left + 200, y + lineGap)
      .stroke();

    doc.text("MONTH/YEAR:", left + 380, y);
    doc
      .moveTo(left + 443, y + lineGap)
      .lineTo(right, y + lineGap)
      .stroke();

    // Put selected facility text if provided
    if (facility) {
      doc.font("Helvetica").fontSize(9);
      doc.text(String(facility), left + 60, y, { width: 190 });
    }

    // ====== Right-aligned Title ======
    y += 28;
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("DAILY MAINTENANCE LOG", left, y, {
      width: right - left,
      align: "center",
    });
    // ====== Table geometry ======
    y += 18;
    const tableTop = y;

    const xDate = left;
    const xTime = left + 50;
    const xRemarks = left + 100;
    const xInitials = right - 100;
    const xEnd = right;

    const headerH = 16;
    const rowH = 16;
    const FIXED_ROWS = 34;
    const maxTableBottom = 680; // keep space for signatures

    drawHLine(tableTop, 1.0);

    doc.font("Helvetica-Bold").fontSize(9);

    doc.text("Date", xDate, tableTop + 4, {
      width: xTime - xDate,
      align: "center",
    });

    doc.text("Time", xTime, tableTop + 4, {
      width: xRemarks - xTime,
      align: "center",
    });

    doc.text("REMARKS", xRemarks, tableTop + 4, {
      width: xInitials - xRemarks,
      align: "center",
    });

    doc.text("Initials", xInitials, tableTop + 4, {
      width: xEnd - xInitials,
      align: "center",
    });

    drawHLine(tableTop + headerH, 1.0);

    const drawTableVerticals = (y1, y2) => {
      drawVLine(xDate, y1, y2, 1.0);
      drawVLine(xTime, y1, y2, 1.0);
      drawVLine(xRemarks, y1, y2, 1.0);
      drawVLine(xInitials, y1, y2, 1.0);
      drawVLine(xEnd, y1, y2, 1.0);
    };

    let curY = tableTop + headerH;

    // ====== Rows (FIXED COUNT) ======
    doc.font("Helvetica").fontSize(8);

    const usedRows = Math.min(rows.length, FIXED_ROWS);

    for (let i = 0; i < FIXED_ROWS; i++) {
      const log = i < usedRows ? rows[i] : null;

      if (log) {
        const d = new Date(log.timestamp);
        const dateStr = d.toISOString().slice(0, 10);
        const timeStr = d.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });

        // centered in columns
        doc.text(dateStr, xDate, curY + 4, {
          width: xTime - xDate,
          align: "center",
        });
        doc.text(timeStr, xTime, curY + 4, {
          width: xRemarks - xTime,
          align: "center",
        });

        // remarks usually look better left-aligned
        doc.text(log.remarks || "", xRemarks + 4, curY + 4, {
          width: xInitials - xRemarks - 8,
          align: "left",
          ellipsis: true,
        });

        doc.text(log.initials || "", xInitials, curY + 4, {
          width: xEnd - xInitials,
          align: "center",
        });
      }

      // always draw the row line (even for empty rows)
      drawHLine(curY + rowH, 0.8);
      curY += rowH;
    }

    drawTableVerticals(tableTop, curY);

    // ====== Signatures (text UNDER the lines, centered) ======
    let sigY = 730;

    // line sizes
    const lineW = 132; // change this to make the underline longer/shorter
    const gap = 70; // space between left block and right block (visual)
    const labelGap = 1; // space between line and label text

    // left block (near left margin)
    const xL = left;

    // right block (near right margin)
    const xR = right - lineW; // <-- this makes it hug the right margin

    // --- RIGHT TOP: DAY SHIFT SUPERVISOR ---
    doc
      .moveTo(xR, sigY)
      .lineTo(xR + lineW, sigY)
      .stroke();
    doc.font("Helvetica").fontSize(9);
    doc.text("DAY SHIFT SUPERVISOR", xR, sigY + labelGap, {
      width: lineW,
      align: "center",
    });

    // --- RIGHT BOTTOM: EVE-MID SHIFT SUPERVISOR ---
    const sigY2 = sigY + 45; // vertical spacing between the two right lines
    doc
      .moveTo(xR, sigY2)
      .lineTo(xR + lineW, sigY2)
      .stroke();
    doc.font("Helvetica").fontSize(9);
    doc.text("EVE-MID SHIFT SUPERVISOR", xR, sigY2 + labelGap, {
      width: lineW,
      align: "center",
    });
    // --- LEFT: FACILITY IN CHARGE ---

    doc
      .moveTo(xL, sigY2)
      .lineTo(xL + lineW, sigY2)
      .stroke();
    doc.font("Helvetica").fontSize(9);
    doc.text("FACILITY IN CHARGE", xL, sigY2 + labelGap, {
      width: lineW,
      align: "center",
    });

    doc.end();
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
    LIMIT 3
  `;

  db.all(sql, [], (err, rows) => {
    // use db.all instead of db.get for multiple rows
    if (err) {
      console.error("Error fetching latest log:", err.message);
      return res.status(500).json({ message: "Failed to fetch latest log" });
    }

    if (!rows || rows.length === 0) return res.json([]);
    res.json(rows);
  });
});

// GET

app.get("/debug/routes", (req, res) => {
  const routes = app._router.stack
    .filter((r) => r.route)
    .map(
      (r) => Object.keys(r.route.methods)[0].toUpperCase() + " " + r.route.path,
    );
  res.json(routes);
});

// UPDATE
// PUT /logs/:id
app.put("/logs/:id", (req, res) => {
  const { id } = req.params;
  const { timeUTC, initials, remarks } = req.body;

  // DEBUG: Check your terminal to see if these are 'undefined'
  console.log("PUT Request Received - ID:", id, "Body:", req.body);

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  const sql = `UPDATE logs SET timeUTC = ?, initials = ?, remarks = ? WHERE id = ?`;

  db.run(sql, [timeUTC, initials, remarks, id], function (err) {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (this.changes === 0) {
      console.log("No rows updated. Does the ID exist in the DB?");
      return res.status(404).json({ message: "Log entry not found" });
    }

    console.log(`Successfully updated ID: ${id}`);
    res.json({ id, timeUTC, initials, remarks });
  });
});

// DELETE /logs/:id
app.delete("/logs/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM logs WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting log:", err.message);
      return res.status(500).json({ message: "Failed to delete log" });
    }

    res.json({ success: true });
  });
});



app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000"),
);
