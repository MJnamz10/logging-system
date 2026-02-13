const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");
const cors = require("cors");
const PDFDocument = require("pdfkit");

/* ============================================================
   SERVER CONFIGURATION
   Express server with CORS and JSON body parsing
   - 50MB limit for image uploads (base64)
============================================================ */
const app = express();
console.log("🔥 RUNNING THIS server.js FILE");

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));           // Allow large JSON payloads for images
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

/* =========================
   DEFAULT ADMIN
========================= */
const defaultAdmin = {
  email: "admincaap",
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
   GET /logs
   Returns all log entries with images (ordered by newest first)
========================= */
app.get("/logs", (req, res) => {
  const sql = "SELECT * FROM logs ORDER BY timestamp DESC";

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching all logs:", err.message);
      return res.status(500).json({ message: "Failed to fetch logs" });
    }
    // Returns all columns including images (JSON string)
    console.log("Fetched logs count:", rows.length); // Debug log
    res.json(rows);
  });
});

/* =========================
   ADD LOG ENTRY
   POST /logs
   Creates a new log entry with optional images
   Body: { timeUTC, initials, remarks, images (JSON string) }
========================= */
app.post("/logs", (req, res) => {
  const { timeUTC, initials, remarks, images, daysup, nightsup } = req.body;
  const timestamp = new Date().toISOString();

  // Validate required fields
  if (!timeUTC || !initials || !remarks) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Ensure images is stored as JSON string (handles both string and array input)
  const imagesJson = typeof images === 'string' ? images : JSON.stringify(images || []);
  
  console.log("Saving log with images:", imagesJson ? "YES" : "NO"); // Debug log

  const sql = `
    INSERT INTO logs (timeUTC, initials, remarks, timestamp, images, daysup, nightsup)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [timeUTC, initials, remarks, timestamp, imagesJson, daysup, nightsup], function (err) {
    if (err) {
      console.error("Error inserting log:", err.message);
      return res.status(500).json({ message: "Failed to save log entry" });
    }

    // Return saved log with all fields including images
    const savedLog = {
      id: this.lastID,
      timeUTC,
      initials,
      remarks,
      timestamp,
      images: imagesJson,
      daysup,
      nightsup
    };
    
    console.log("Log saved successfully with ID:", this.lastID); // Debug log
    res.json(savedLog);
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
    const firstDayRecord = rows.find(r => r.daysup && String(r.daysup).trim() !== "");
    const firstNightRecord = rows.find(r => r.nightsup && String(r.nightsup).trim() !== "");

    const lockedDayName = firstDayRecord ? firstDayRecord.daysup.toUpperCase() : "";
    const lockedNightName = firstNightRecord ? firstNightRecord.nightsup.toUpperCase() : "";

    // Tell browser it's a PDF download/preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="daily-maintenance-log.pdf"`,
    );

    const doc = new PDFDocument({ size: "A4", margin: 36 });
    doc.pipe(res);

    // ====== Constants ======
    const PAGE_W = 595;
    const left = 25;
    const right = PAGE_W - 20;
    const pageTop = 116;
    const CELL_PAD = 2;          // padding inside each cell
    const ROW_H = 16;            // FIXED row-line height (like ruled paper)
    const SIGNATURE_SPACE = 20; // space reserved for signatures on last page
    const PAGE_BOTTOM = 842;     // usable bottom of A4
    // Column X positions
    const xDate = left;
    const xTime = left + 60;
    const xRemarks = left + 100;
    const xInitials = right - 90;
    const xEnd = right;
    const headerH = 0;
    const remarksW = xInitials - xRemarks - 2 * CELL_PAD; // available text width for remarks

    let pageNum = 0;  // track pages for continuation label
    let curY = 0;     // current Y cursor
    let tableTopOnPage = 0; // where the table starts on the current page

    // ====== Drawing helpers ======
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

    const drawTableVerticals = (y1, y2) => {
      drawVLine(xDate, y1, y2, 1.0);
      drawVLine(xTime, y1, y2, 1.0);
      drawVLine(xRemarks, y1, y2, 1.0);
      drawVLine(xInitials, y1, y2, 1.0);
      drawVLine(xEnd, y1, y2, 1.0);
    };

    // Split remarks into lines that each fit within the remarks column width.
    // Works like writing on lined paper — fills a line, then continues on the next.
    const splitTextIntoLines = (text) => {
      if (!text || text.trim() === "") return [""];
      doc.font("Helvetica").fontSize(10);

      const words = text.split(/\s+/);
      const lines = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word;
        const testWidth = doc.widthOfString(testLine);

        if (testWidth > remarksW && currentLine) {
          // Current line is full — push it and start a new line with this word
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) lines.push(currentLine);
      return lines.length > 0 ? lines : [""];
    };

    
    // ====== Draw page header + table header ======
    const drawPageHeader = () => {
      pageNum++;

     doc.font("Helvetica").fontSize(9);
     doc.text("", left, pageTop, {
       align: "center",
     width: right - left,
      });
      doc.text("", {
        align: "center",
      });

     doc.font("Helvetica-Bold").fontSize(10);
      doc.text("", {
        align: "justified",
      });
      doc.text("", { align: "center" });
      
      doc.moveDown(1);

      // Facility / Month-Year lines
      let y = doc.y + 8;
      const lineGap = 8;
      doc.font("Helvetica").fontSize(12);
      doc.text("LAGUINDINGAN CNF", left + 60, y);
      /*doc
        .moveTo(left + 41, y + lineGap)
        .lineTo(left + 200, y + lineGap)
        .stroke(0);*/
      
      doc.text("", left + 380, y);
      /*doc
        .moveTo(left + 443, y + lineGap)
        .lineTo(right, y + lineGap)
        .stroke();*/

         const monthYear = new Date().toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      
      doc.font("Helvetica").fontSize(12);
        doc.text(monthYear, left + 455, y);

      if (facility) {
        doc.font("Helvetica").fontSize(12);
        doc.text(String(facility), left + 60, y, { width: 190 });
      }

      // Title
      y += 28;
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("", left, y, {
        width: right - left,
        align: "center",
      });

      // Continuation label for pages after the first
      if (pageNum > 1) {
        doc.font("Helvetica").fontSize(10);
        /*doc.text(`(Continuation - Page ${pageNum})`, left, y + 12, {
          width: right - left,
          align: "center",
        });
        y += 12;*/
      }

      // Table column headers
      y += 18;
      tableTopOnPage = y;

      drawHLine(y, 1.0);

      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("", xDate, y + 4, {
        width: xTime - xDate,
        align: "center",
      });
      doc.text("", xTime, y + 4, {
        width: xRemarks - xTime,
        align: "center",
      });
      doc.text("", xRemarks, y + 4, {
        width: xInitials - xRemarks,
        align: "center",
      });
      doc.text("", xInitials, y + 4, {
        width: xEnd - xInitials,
        align: "center",
      });

      drawHLine(y + headerH, 1.0);

      curY = y + headerH;
    };
    console.log("curY:", curY);
console.log("curY + 120:", curY + 120);

    // ====== Draw signatures (only on the last page) ======
    // ====== Draw signatures (only on the last page) ======
    const drawSignatures = () => {
      const sigY = curY + 40;
      const lineW = 160; 
      const labelGap = 2;   
      const nameGap = 12;   
      const xL = left;
      const xR = right - lineW;

      doc.font("Helvetica-Bold").fontSize(10);

      // --- DAY SHIFT SUPERVISOR ---
      // Uses the locked name found at the start of the process
      if (lockedDayName) {
          doc.text(lockedDayName, xR, sigY - nameGap, { width: lineW, align: "center" });
      }
      doc.moveTo(xR, sigY).lineTo(xR + lineW, sigY);
      doc.font("Helvetica").fontSize(10);
      doc.text("", xR, sigY + labelGap, { width: lineW, align: "center" });

      // --- EVE-MID SHIFT SUPERVISOR ---
      // Even if Day was found in row 1 and Night in row 20, they display together here
      const sigY_Night = sigY + 45;
      doc.font("Helvetica-Bold").fontSize(10);
      if (lockedNightName) {
          doc.text(lockedNightName, xR, sigY_Night - nameGap, { width: lineW, align: "center" });
      }
      doc.moveTo(xR, sigY_Night).lineTo(xR + lineW, sigY_Night);
      doc.font("Helvetica").fontSize(10);
      doc.text("", xR, sigY_Night + labelGap, { width: lineW, align: "center" });

      // --- FACILITY IN CHARGE ---
      doc.font("Helvetica-Bold").fontSize(10);
      doc.text("GERALDMIL M. PANGAN", xL, sigY_Night - nameGap, { width: lineW, align: "center" });
      doc.moveTo(xL, sigY_Night).lineTo(xL + lineW, sigY_Night);
      doc.font("Helvetica").fontSize(10);
      doc.text("", xL, sigY_Night + labelGap, { width: lineW, align: "center" });
    };

    // ====== Start a new continuation page ======
    const startNewPage = () => {
      // Close vertical lines of current table
      drawTableVerticals(tableTopOnPage, curY);

      // Add new page
      doc.addPage();

      // Draw header again
      drawPageHeader();
    };

    // How many fixed lines remain on the current page
    const linesRemainingOnPage = () => {
      const bottom = PAGE_BOTTOM - SIGNATURE_SPACE
      return Math.floor((bottom - curY) / ROW_H);
    };

    // ====== Begin first page ======
    drawPageHeader();

    // ====== Render rows (fixed-line ruled-paper style) ======
    for (let i = 0; i < rows.length; i++) {
      const log = rows[i];
      const isLastEntry = i === rows.length - 1;

      const remarksText = log.remarks || "";
      const remarkLines = splitTextIntoLines(remarksText);

      // If not even one line fits, go to a new page
      if (curY + ROW_H > PAGE_BOTTOM - 120) {
        startNewPage();
      }


      // Format date and time
      const displayTime = log.timeUTC || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }) : "");

      const d = new Date(log.timestamp);
      const dateStr = d.toISOString().slice(0, 10);

      // Draw Date, Time, and Initials on the first line of this log entry
      doc.font("Helvetica").fontSize(9);
      doc.text(dateStr, xDate + 6, curY + CELL_PAD,  { width: 50, align: "center",   lineBreak: false });
      doc.text(displayTime, xTime - 5, curY + CELL_PAD, { width: 50, align: "center" });
      doc.text(log.initials || "", xInitials, curY + CELL_PAD, { width: xEnd - xInitials, align: "center" });

      // Draw Remarks line by line
      remarkLines.forEach((line, rIdx) => {
        // If remarks overflow to a new page, handle the break
        if (rIdx > 0 && linesRemainingOnPage() < 1) {
            startNewPage();
        }

        doc.text(line, xRemarks + CELL_PAD + 10, curY + CELL_PAD, { 
            width: remarksW, 
            align: "justified",
            lineBreak: false 
        });
        
        curY += ROW_H;
        drawHLine(curY);
      });
    }

    // If no rows at all, still show empty ruled lines
    if (rows.length === 0) {
      for (let i = 0; i < 34; i++) {
        curY += ROW_H;
        drawHLine(curY, 0.8);
      }
    }
   const requiredSignatureSpace = 120;

    if (curY + requiredSignatureSpace > PAGE_BOTTOM) {
      doc.addPage();
      drawPageHeader();
    }

    drawTableVerticals(tableTopOnPage, curY);
    drawSignatures();


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

/* =========================
   UPDATE LOG ENTRY
   PUT /logs/:id
   Updates an existing log entry with new data and images
   Params: id (log entry ID)
   Body: { timeUTC, initials, remarks, images (JSON string) }
========================= */
app.put("/logs/:id", (req, res) => {
  const { id } = req.params;
  const { timeUTC, initials, remarks, images, daysup, nightsup } = req.body;

  // Debug: Log incoming request
  console.log("PUT Request - ID:", id, "Has images:", !!images);

  // Validate ID
  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  // Ensure images is stored as JSON string
  const imagesJson = typeof images === 'string' ? images : JSON.stringify(images || []);

  const sql = `UPDATE logs SET timeUTC = ?, initials = ?, remarks = ?, images = ?, daysup = ?, nightsup = ? WHERE id = ?`;

  db.run(sql, [timeUTC, initials, remarks, imagesJson, daysup, nightsup, id], function (err) {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (this.changes === 0) {
      console.log("No rows updated. ID may not exist:", id);
      return res.status(404).json({ message: "Log entry not found" });
    }

    console.log("Successfully updated log ID:", id);
    res.json({ id, timeUTC, initials, remarks, images: imagesJson, daysup, nightsup });
  });
});

/* =========================
   DELETE LOG ENTRY
   DELETE /logs/:id
   Removes a log entry from the database
   Params: id (log entry ID to delete)
========================= */
app.delete("/logs/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM logs WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting log:", err.message);
      return res.status(500).json({ message: "Failed to delete log" });
    }

    console.log("Deleted log ID:", id);
    res.json({ success: true });
  });
});



app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000"),
);
