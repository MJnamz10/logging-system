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
   EXPORT LOGS AS PDF (DOCX-style table)
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

  // NOTE: only apply facility filter if your DB has a "facility" column.
  // If you don't have it, REMOVE this block.
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

    const firstDayRecord = rows.find(
      (r) => r.daysup && String(r.daysup).trim() !== ""
    );
    const firstNightRecord = rows.find(
      (r) => r.nightsup && String(r.nightsup).trim() !== ""
    );

    const lockedDayName = firstDayRecord
      ? String(firstDayRecord.daysup).toUpperCase()
      : "";
    const lockedNightName = firstNightRecord
      ? String(firstNightRecord.nightsup).toUpperCase()
      : "";

    // Tell browser it's a PDF download/preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="daily-maintenance-log.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 10 });
    doc.pipe(res);

    // ====== Layout constants ======
    const PAGE_W = doc.page.width;  // ~595
    const PAGE_H = doc.page.height; // ~842
    const left = doc.page.margins.left;   // 36
    const right = PAGE_W - doc.page.margins.right; // 559
    const CELL_PAD = 2;
    const PAGE_START_Y = 118; 

    const ROW_H = 15.5;               // ruled line height
    const SIGNATURE_SPACE = 0;    // reserved space on last page
    const PAGE_BOTTOM = PAGE_H - doc.page.margins.bottom; // ~806

    // Column widths (adjust if you want)
    const wDate = 70;
    const wTime = 55;
    const wInitials = 70;
    const wRemarks = (right - left) - (wDate + wTime + wInitials);

    // Column X positions
    const xDate = left;
    const xTime = xDate + wDate;
    const xRemarks = xTime + wTime;
    const xInitials = xRemarks + wRemarks;
    const xEnd = right;
    const ROWS_PER_PAGE = 34;


    // Derived
    const remarksW = wRemarks - 2 * CELL_PAD;

    let pageNum = 0;
    let curY = 0;
    let tableTopOnPage = 0;

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
      doc.moveTo(x, y1).lineTo(x, y2).stroke(); //.stroke()
      doc.restore();
    };

    const drawTableVerticals = (y1, y2) => {
      drawVLine(xDate, y1, y2, 1.0);
      drawVLine(xTime, y1, y2, 1.0);
      drawVLine(xRemarks, y1, y2, 1.0);
      drawVLine(xInitials, y1, y2, 1.0);
      drawVLine(xEnd, y1, y2, 1.0);
    };

    const monthYearLabel = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Split remarks to fit column width, into multiple ruled lines
    const splitTextIntoLines = (text) => {
      if (!text || String(text).trim() === "") return [""];
      doc.font("Helvetica").fontSize(9);

      const words = String(text).split(/\s+/);
      const lines = [];
      let currentLine = "";

      for (const word of words) {
        const test = currentLine ? `${currentLine} ${word}` : word;
        if (doc.widthOfString(test) > remarksW && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = test;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines.length ? lines : [""];
    };

    const linesRemainingOnPage = () => {
      const bottom = PAGE_BOTTOM - SIGNATURE_SPACE;
      return Math.floor((bottom - curY) / ROW_H);
    };

    // ====== DOCX-style page header + table header ======
    const drawPageHeader = () => {
    pageNum++;

    // ✅ force where the page content starts
    doc.y = PAGE_START_Y;

    // Facility / Month-Year rows
    const yInfo = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).text("LAGUINDINGAN CNF", left + 85, yInfo);
    doc.font("Helvetica").fontSize(10).text(monthYearLabel, left + 470, yInfo);

    doc.moveDown(1.2);


    doc.moveDown(0.8);

    // 👇 Add this line
    const TABLE_OFFSET_Y = 34; // increase to push table lower

    const y = doc.y + TABLE_OFFSET_Y;
    tableTopOnPage = y;

    // Top border of table
    drawHLine(y, 1.0);

    // Start writing rows immediately
    curY = y;

    // Draw vertical lines starting from here
    drawTableVerticals(y, y);


  };


const drawSignatures = () => {
  const lineW = 160;
  const nameGap = 12;
  const xL = left;
  const xR = right - lineW;

  // ✅ Anchor near the bottom of the page
  const bottomMargin = doc.page.margins.bottom;           // usually 36
  const baseY = doc.page.height - bottomMargin - 98;      // move this number to go higher/lower

  const sigY = baseY;
  const sigY2 = baseY + 45;

  doc.font("Helvetica-Bold").fontSize(10);

  // DAY SHIFT SUPERVISOR
  if (lockedDayName) {
    doc.text(lockedDayName, xR, sigY - nameGap, { width: lineW, align: "center" });
  }
  doc.moveTo(xR, sigY).lineTo(xR + lineW, sigY);

  // EVE-MID SHIFT SUPERVISOR
  if (lockedNightName) {
    doc.text(lockedNightName, xR, sigY2 - nameGap, { width: lineW, align: "center" });
  }
  doc.moveTo(xR, sigY2).lineTo(xR + lineW, sigY2);

  // FACILITY IN CHARGE
  doc.text("GERALDMIL M. PANGAN", xL, sigY2 - nameGap, { width: lineW, align: "center" });
  doc.moveTo(xL, sigY2).lineTo(xL + lineW, sigY2);
};

// ✅ Close table lines + draw signatures for the CURRENT page
const finalizePage = () => {
  // close vertical lines for the table area on this page
  drawTableVerticals(tableTopOnPage, curY);

  // draw signatures at bottom of THIS page
  drawSignatures();
};

    // ====== Page break ======
// ====== Page break ======
const startNewPage = () => {
  // ✅ finish current page (table borders + signatures)
  finalizePage();

  doc.addPage();
  drawPageHeader();
};
    // ====== Begin first page ======
    drawPageHeader();
// ====== Render logs in fixed 34 ruled rows per page (remarks can consume multiple rows) ======
let logIndex = 0;
let pendingLines = [];
let pendingMeta = null; // { dateStr, displayTime, initials }
let metaPrinted = false;

while (logIndex < rows.length || pendingLines.length > 0 || logIndex === 0) {

  for (let row = 0; row < ROWS_PER_PAGE; row++) {

    // New page (after first page)
    if (row === 0 && (logIndex !== 0 || pendingLines.length > 0) && curY !== tableTopOnPage) {
      startNewPage();
    }

    // Load next log if we don't have lines to print
    if (pendingLines.length === 0) {
      const log = rows[logIndex];

      if (log) {
        const d = log.timestamp ? new Date(log.timestamp) : null;

        const dateStr = d ? d.toISOString().slice(0, 10) : "";
        const displayTime =
          log.timeUTC ||
          (d
            ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
            : "");

        const initials = log.initials || "";
        const remarksText = log.remarks || "";

        pendingLines = splitTextIntoLines(remarksText); // your existing function
        pendingMeta = { dateStr, displayTime, initials };
        metaPrinted = false;

        logIndex++;
      } else {
        // No more logs: blank line
        pendingLines = [""];
        pendingMeta = { dateStr: "", displayTime: "", initials: "" };
        metaPrinted = true; // keep blanks
      }
    }

    // Print exactly ONE ruled row
    const line = pendingLines.shift() ?? "";

    doc.font("Helvetica").fontSize(9);

    // Only print date/time/initials on the FIRST line of that entry
    const dateStr = (!metaPrinted && pendingMeta) ? pendingMeta.dateStr : "";
    const displayTime = (!metaPrinted && pendingMeta) ? pendingMeta.displayTime : "";
    const initials = (!metaPrinted && pendingMeta) ? pendingMeta.initials : "";

    doc.text(dateStr, xDate, curY + CELL_PAD, {
      width: wDate ,
      align: "center",
      lineBreak: false,
    });

    doc.text(displayTime, xTime, curY + CELL_PAD, {
      width: wTime,
      align: "center",
      lineBreak: false,
    });

    doc.text(initials, xInitials, curY + CELL_PAD, {
      width: wInitials,
      align: "center",
      lineBreak: false,
    });

    // IMPORTANT: keep width so it wraps into our split lines, BUT we only draw one line here
    doc.text(line, xRemarks + CELL_PAD, curY + CELL_PAD, {
      width: remarksW,
      align: "left",
      lineBreak: false,
    });

    // After printing first line, clear meta
    if (!metaPrinted) metaPrinted = true;

    // Advance to next ruled row
    curY += ROW_H;
    drawHLine(curY);
  }

  // If we've printed all logs and no pending lines left, stop
  if (logIndex >= rows.length && pendingLines.length === 0) break;
}


    // If signatures won't fit, push to new page
    if (curY + SIGNATURE_SPACE > PAGE_BOTTOM) {
      startNewPage();
    }

// ✅ Finish the last page too
finalizePage();

doc.end();
  });
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
  const { password } = req.body;

  // Check password first
  if (password !== "caapANS10") {
    return res.status(403).json({ message: "Incorrect password" });
  }

  db.run("DELETE FROM logs WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting log:", err.message);
      return res.status(500).json({ message: "Failed to delete log" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Log not found" });
    }

    console.log("Deleted log ID:", id);
    res.json({ success: true });
  });
});

/* =========================
   FETCH ALL DPOR ENTRIES
   GET /dpor
========================= */
app.get("/dpor", (req, res) => {
  const sql = "SELECT * FROM dpor_entries ORDER BY created_at DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching DPOR:", err.message);
      return res.status(500).json({ message: "Failed to fetch DPOR entries" });
    }
    res.json(rows);
  });
});

/* =========================
   ADD NEW DPOR ENTRY
   POST /dpor
========================= */
app.post("/dpor", (req, res) => {
  const { report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory } = req.body;
  const created_at = new Date().toISOString();

  const sql = `
    INSERT INTO dpor_entries (report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory, created_at], function (err) {
    if (err) {
      console.error("Error saving DPOR:", err.message);
      return res.status(500).json({ message: "Failed to save DPOR entry" });
    }
    res.json({ 
      id: this.lastID, 
      report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory, created_at 
    });
  });
});

/* =========================
   UPDATE DPOR ENTRY
   PUT /dpor/:id
========================= */
app.put("/dpor/:id", (req, res) => {
  const { id } = req.params;
  const { report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory } = req.body;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid ID provided" });
  }

  const sql = `
    UPDATE dpor_entries 
    SET report_date = ?, dpor_for = ?, operational_remarks = ?, staff_on_ot = ?, personnel_count = ?, signatory = ? 
    WHERE id = ?
  `;

  db.run(sql, [report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory, id], function (err) {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (this.changes === 0) {
      console.log("No rows updated. ID may not exist:", id);
      return res.status(404).json({ message: "DPOR entry not found" });
    }

    console.log("Successfully updated DPOR ID:", id);
    res.json({ id, report_date, dpor_for, operational_remarks, staff_on_ot, personnel_count, signatory });
  });
});

/* =========================
   DELETE DPOR ENTRY
   DELETE /dpor/:id
========================= */
app.delete("/dpor/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM dpor_entries WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting DPOR:", err.message);
      return res.status(500).json({ message: "Failed to delete DPOR entry" });
    }

    console.log("Deleted DPOR ID:", id);
    res.json({ success: true });
  });
});

app.listen(5001, () =>
  console.log("✅ Server running on http://localhost:5001"),
);