import React, { useEffect, useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import logIcon from "../assets/Mask group.png";
import clock from "../assets/clock-bold.svg";
import add from "../assets/add.png";
import exp from "../assets/export.png";
import search from "../assets/search-icon.png";
import del from "../assets/delete.png";
import edit from "../assets/edit.png";
import "../css/dashboard.css";
import AddLogEntryModal from "./AddLogEntryModal";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   DASHBOARD COMPONENT
   Main dashboard page with log entries table and quick actions
============================================================ */
function Dashboard({ latestLogs, setLatestLogs }) {
  const location = useLocation();
  const navigate = useNavigate();

  /* ----------------------------------------------------------
     STATE VARIABLES
  ---------------------------------------------------------- */
  const [dateTime, setDateTime] = useState(new Date()); // Current date/time for clock
  const [showAddLog, setShowAddLog] = useState(false); // Toggle Add Log modal
  const [editingLog, setEditingLog] = useState(null); // Log being edited (null = not editing)
  const [searchTerm, setSearchTerm] = useState(""); // Search filter text
  const [previewImage, setPreviewImage] = useState(null); // for full-screen preview

  /* ----------------------------------------------------------
     EFFECT: Real-time clock update (every second)
  ---------------------------------------------------------- */
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ----------------------------------------------------------
     ACTION: Export logs as PDF
     Downloads all logs as a formatted PDF document
  ---------------------------------------------------------- */
 const handleExportPdf = async () => {
  const today = new Date().toISOString().slice(0, 10); // e.g., "2026-02-13"

  // Pass both `from` and `to` as today
  const response = await fetch(
    `http://localhost:5001/logs/export/pdf?from=${today}&to=${today}`
  );

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `logs-${today}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};


  /* ----------------------------------------------------------
     ACTION: Add new log entry
     Sends new log to backend and updates local state with response
     - entry: Object containing timeUTC, initials, remarks, images
     - Returns true on success, false on failure
  ---------------------------------------------------------- */
  const handleSaveLog = async (entry) => {
    console.log("Saving log entry with images:", entry); // Debug log

    try {
      const res = await fetch("http://localhost:5001/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server error:", errorData);
        alert(`Error saving log: ${errorData.message || "Unknown error"}`);
        return false;
      }

      const savedLog = await res.json();
      console.log("Backend response:", savedLog); // Debug log

      // Update local state with the saved log (includes images from backend)
      setLatestLogs((prev) => [...prev, savedLog]);
      setShowAddLog(false);
      return true;
    } catch (error) {
      console.error("Network error saving log:", error);
      alert(`Failed to save log entry: ${error.message}`);
      return false;
    }
  };

  /* ----------------------------------------------------------
     ACTION: Update existing log entry
     Sends updated log to backend and updates local state
     - updatedLog: Object with id and updated fields
  ---------------------------------------------------------- */
  const handleUpdateLog = async (updatedLog) => {
    // Validate ID exists before sending request
    if (!updatedLog.id) {
      console.error("Error: The log object is missing an ID!");
      return;
    }

    console.log("Updating log entry:", updatedLog); // Debug log

    try {
      const res = await fetch(`http://localhost:5001/logs/${updatedLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLog),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Update response:", data); // Debug log

        // Update local state with the modified log
        setLatestLogs((prev) =>
          prev.map((log) =>
            log.id === updatedLog.id ? { ...log, ...data } : log,
          ),
        );
        setEditingLog(null);
        alert("Update Successful");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  /* ----------------------------------------------------------
     ACTION: Delete log entry
     Removes log from backend and local state after confirmation
     - id: ID of the log entry to delete
  ---------------------------------------------------------- */
 
  const handleDeleteLog = async (id) => {
  const password = prompt("Enter admin password to delete this log:");

  if (!password) return;

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this log entry? This action cannot be undone."
  );
  if (!confirmDelete) return;

  const res = await fetch(`http://localhost:5001/logs/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message);
    return;
  }

  setLatestLogs((prev) => prev.filter((log) => log.id !== id));

  alert("Log entry deleted successfully");
};



  /* ----------------------------------------------------------
     COMPUTED: Filtered and sorted logs
     - Sorts by timestamp (oldest to newest)
     - Filters by search term (time, initials, or remarks)
  ---------------------------------------------------------- */
  const todayUTC = new Date();
  const filteredLogs = [...latestLogs]
    .filter((log) => {
      const logDate = new Date(log.timestamp);
      return (
        logDate.getUTCFullYear() === todayUTC.getUTCFullYear() &&
        logDate.getUTCMonth() === todayUTC.getUTCMonth() &&
        logDate.getUTCDate() === todayUTC.getUTCDate()
      );
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((log) => {
      if (!searchTerm.trim()) return true;
      return (
        log.timeUTC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new RegExp(`\\b${searchTerm}\\b`, "i").test(log.remarks || "")
      );
    });

  /* ============================================================
     RENDER: Main Dashboard Layout
  ============================================================ */
  return (
    <div className="dashboard-page">
      <div className="dash-header"></div>

      <div className="dashboard-container">
        {/* ------ Logo and Title ------ */}
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>

        <div className="sidebar-divider"></div>

        <div className="dash-options">
          {/* ====== SIDEBAR NAVIGATION ====== */}
          <div
            className={
              location.pathname === "/dashboard" ? "active-item" : "item"
            }
            onClick={() => navigate("/dashboard")}
          >
            <img src={home} alt="icon" className="dash-icon1" />
            Dashboard
          </div>

          <div
            className={location.pathname === "/logs" ? "active-item" : "item"}
            onClick={() => navigate("/logs")}
          >
            <img src={logIcon} alt="icon" className="dash-icon" />
            <h className="logs">Logs</h>
          </div>
          <div
            className={
              location.pathname === "/summary" ? "active-item" : "item"
            }
            onClick={() => navigate("/summary")}
          >
            <img src={logIcon} alt="icon" className="dash-icon" />
            <h className="logs">Summary</h>
          </div>

          <div
            className={location.pathname === "/dpor" ? "active-item" : "item"}
            onClick={() => navigate("/dpor")}
          >
            <img src={logIcon} alt="icon" className="dash-icon" />
            <h className="logs">DPOR</h>
          </div>

          {/* ====== HEADER WITH CLOCK ====== */}
          <div className="header-container">
            <h className="header-title">Air Navigation Service</h>
            <div className="datetime-container">
              <img src={clock} alt="clock" className="clock-icon" />
              <span className="datetime-single">
                {dateTime.toLocaleTimeString("en-GB", {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                {dateTime.toLocaleDateString("en-US", {
                  timeZone: "UTC",
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* ====== QUICK ACTIONS BUTTONS ====== */}
          <div className="quick-actions">
            <h className="quick-text">Quick Actions</h>
            <div className="actions-items">
              {/* Add Log Entry Button */}
              <button className="action" onClick={() => setShowAddLog(true)}>
                <p className="action-text1">Add Log Entry</p>
                <p className="action-text2">Record a new event or note</p>
                <div className="add-container">
                  <img src={add} alt="add" className="add-icon" />
                </div>
              </button>

              {/* Export PDF Button */}
              <button className="action" onClick={handleExportPdf}>
                <p className="action-text1">Export PDF</p>
                <p className="action-text2">Download log as PDF report</p>
                <div className="export-container">
                  <img src={exp} alt="export" className="export-icon" />
                </div>
              </button>
            </div>
          </div>

          {/* ====== LOG ENTRIES TABLE ====== */}
          <div className="entry-container">
            {/* Table Header with search */}
            <div className="table-header">
              <h className="entry-text">
                Log Entries
                <span className="entry-text2">Air Navigation Force</span>
              </h>
              <div className="viewlogs-icon-container">
                <svg
                  className="viewlogs-icon"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 2 H14 L19 7 V20 A2 2 0 0 1 17 22 H6 A2 2 0 0 1 4 20 V4 A2 2 0 0 1 6 2 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2 V7 H19"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 12 H15"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 16 H15"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="entries-wrapper">
                <p className="entries-count">{filteredLogs.length} </p>
                <p className="total">TOTAL ENTRIES</p>
              </div>

              {/* Search Input */}
              <div className="table-controls">
                <img src={search} alt="search" className="search-symbol" />
                <input
                  className="search-input"
                  placeholder="Search time, initials, or remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table Body - Log Entries List */}
            <div className="table-container">
              {filteredLogs.length > 0 ? (
                <table className="logs-table">
                  <thead>
                    <tr className="texts">
                      <th>#</th>
                      <th>Date</th>
                      <th>Time (UTC)</th>
                      <th>Initials</th>
                      <th>Remarks</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log, index) => (
                      <tr className="texts-two" key={log.id}>
                        <td>{index + 1}</td>
                        <td>
                          {new Date(log.timestamp).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            month: "numeric",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td>{log.timeUTC}</td>
                        <td>{log.initials}</td>
                        <td className="remarks">{log.remarks}</td>
                        <td className="image-cell">
                          {(() => {
                            if (!log.images)
                              return <span className="no-image">No Image</span>;

                            let parsed = [];

                            try {
                              parsed =
                                typeof log.images === "string"
                                  ? JSON.parse(log.images)
                                  : log.images;
                            } catch (err) {
                              console.error("Image parse error:", err);
                              return <span className="no-image">No Image</span>;
                            }

                            if (!parsed.length)
                              return <span className="no-image">No Image</span>;

                            return parsed.map((img, i) => (
                              <img
                                key={i}
                                src={img.data}
                                alt="log"
                                className="table-image"
                                onClick={() => setPreviewImage(img.data)} // open preview
                              />
                            ));
                          })()}

                          {previewImage && (
                            <div
                              className="image-preview-overlay"
                              onClick={() => setPreviewImage(null)}
                            >
                              <div
                                className="image-preview-container"
                                onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
                              >
                                <button
                                  className="preview-close-btn"
                                  onClick={() => setPreviewImage(null)}
                                >
                                  ✕
                                </button>
                                <img
                                  src={previewImage}
                                  alt="Full Preview"
                                  className="full-preview-image"
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        {/* Actions Column - Edit & Delete */}
                        <td className="actions-icons">
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => setEditingLog(log)}
                            title="Edit log"
                          >
                            <img src={edit} alt="edit" />
                          </button>

                          <button
                            className="icon-btn delete-btn"
                            onClick={() => handleDeleteLog(log.id)}
                            title="Delete log"
                          >
                            <img src={del} alt="delete" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-entry">No matching log entries</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== ADD/EDIT LOG ENTRY MODAL ====== */}
      {(showAddLog || !!editingLog) && (
        <AddLogEntryModal
          key={editingLog ? `edit-${editingLog.id}` : "add-new"}
          isOpen={true}
          onClose={() => {
            setShowAddLog(false);
            setEditingLog(null);
          }}
          onSave={editingLog ? handleUpdateLog : handleSaveLog}
          initialData={editingLog}
          
        />
      )}
    </div>
  );
}

export default Dashboard;
