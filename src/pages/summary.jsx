import React, { useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import logIcon from "../assets/Mask group.png";
import search from "../assets/search-icon.png";
import "../css/summary.css";
import AddLogEntryModal from "./AddLogEntryModal";
import { useLocation, useNavigate } from "react-router-dom";

/* ============================================================
   DASHBOARD COMPONENT
   Main dashboard page with log entries table and quick actions
============================================================ */
function Summary({ latestLogs, setLatestLogs }) {
  const location = useLocation();
  const navigate = useNavigate();

  /* ----------------------------------------------------------
     STATE VARIABLES
  ---------------------------------------------------------- */

  const [showAddLog, setShowAddLog] = useState(false); // Toggle Add Log modal
  const [editingLog, setEditingLog] = useState(null); // Log being edited (null = not editing)
  const [searchTerm, setSearchTerm] = useState(""); // Search filter text
  const [previewImage, setPreviewImage] = useState(null); // for full-screen preview

  /* ----------------------------------------------------------
     EFFECT: Real-time clock update (every second)
  ---------------------------------------------------------- */

  /* ----------------------------------------------------------
     ACTION: Export logs as PDF
     Downloads all logs as a formatted PDF document
  ---------------------------------------------------------- */
  /* ----------------------------------------------------------
     ACTION: Add new log entry
     Sends new log to backend and updates local state with response
     - entry: Object containing timeUTC, initials, remarks, images
     - Returns true on success, false on failure
  ---------------------------------------------------------- */
  const handleSaveLog = async (entry) => {
    console.log("Saving log entry with images:", entry); // Debug log

    try {
      const res = await fetch("http://localhost:5000/logs", {
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
      const res = await fetch(`http://localhost:5000/logs/${updatedLog.id}`, {
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
     COMPUTED: Filtered and sorted logs
     - Sorts by timestamp (oldest to newest)
     - Filters by search term (time, initials, or remarks)
  ---------------------------------------------------------- */
  const filteredLogs = [...latestLogs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((log) => {
      if (!searchTerm.trim()) return true;
      return (
        log.timeUTC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  /* ============================================================
     RENDER: Main Dashboard Layout
  ============================================================ */
  return (
    <div className="summary-page">
      <div className="sum-header"></div>

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

          {/* ====== LOG ENTRIES TABLE ====== */}
          <div className="entry-container1">
            {/* Table Header with search */}
            <div className="table-header">
              <h className="entry-text">
                Overall Summary
                <span className="entry-text3">Air Navigation Force</span>
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
            <div className="table-container1">
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
                        <td>{log.remarks}</td>
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

export default Summary;
