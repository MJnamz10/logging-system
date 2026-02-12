import React, { useEffect, useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import logIcon from "../assets/Mask group.png";
import clock from "../assets/clock-bold.svg";
import add from "../assets/add.png";
import exp from "../assets/export.png";
import search from "../assets/search-icon.png";
//import viewlogs from "../assets/view.png";
import del from "../assets/delete.png";
import edit from "../assets/edit.png";
import "../css/dashboard.css";
import AddLogEntryModal from "./AddLogEntryModal";
import { useLocation, useNavigate } from "react-router-dom";

function Dashboard({ latestLogs, setLatestLogs }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());
  const [showAddLog, setShowAddLog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // CLOCK
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // EXPORT PDF
  const handleExportPdf = async () => {
    const response = await fetch("http://localhost:5000/logs/export/pdf");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ADD LOG
  const handleSaveLog = async (entry) => {
    const res = await fetch("http://localhost:5000/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    const savedLog = await res.json();
    setLatestLogs((prev) => [...prev, savedLog]);
    setShowAddLog(false);
  };

  // UPDATE LOG
  const handleUpdateLog = async (updatedLog) => {
    // Check if ID exists before sending
    if (!updatedLog.id) {
      console.error("Error: The log object is missing an ID!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/logs/${updatedLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLog),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setLatestLogs((prev) =>
          prev.map((log) =>
            log.id === updatedLog.id ? { ...log, ...data } : log,
          ),
        );
        setEditingLog(null);
        alert("Update Successful"); // Temporary alert to confirm
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  // DELETE LOG
  const handleDeleteLog = async (id) => {
    if (!window.confirm("Delete this log entry?")) return;

    await fetch(`http://localhost:5000/logs/${id}`, {
      method: "DELETE",
    });

    setLatestLogs((prev) => prev.filter((log) => log.id !== id));
  };

  // FILTER + SORT (OLDEST → NEWEST)
  const filteredLogs = [...latestLogs]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .filter((log) => {
      if (!searchTerm.trim()) return true;
      return (
        log.timeUTC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // LAYOUT AND UI LOGIC

  return (
    <div className="dashboard-page">
      <div className="dash-header"></div>

      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>

        <div className="sidebar-divider"></div>

        <div className="dash-options">
          {/* SIDEBAR */}
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

          {/* HEADER */}
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

          {/* QUICK ACTIONS */}
          <div className="quick-actions">
            <h className="quick-text">Quick Actions</h>
            <div className="actions-items">
              <button className="action" onClick={() => setShowAddLog(true)}>
                <p className="action-text1">Add Log Entry</p>
                <p className="action-text2">Record a new event or note</p>
                <div className="add-container">
                  <img src={add} alt="add" className="add-icon" />
                </div>
              </button>

              <button className="action" onClick={handleExportPdf}>
                <p className="action-text1">Export PDF</p>
                <p className="action-text2">Download log as PDF report</p>
                <div className="export-container">
                  <img src={exp} alt="export" className="export-icon" />
                </div>
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="entry-container">
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
                    stroke-width="2"
                    stroke-linejoin="round"
                  />

                  <path
                    d="M14 2 V7 H19"
                    fill="none"
                    stroke="white"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />

                  <path
                    d="M8 12 H15"
                    stroke="white"
                    stroke-width="1"
                    stroke-linecap="round"
                  />
                  <path
                    d="M8 16 H15"
                    stroke="white"
                    stroke-width="1"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div class="entries-wrapper">
                <p className="entries-count">{filteredLogs.length} </p>
                <p className="total">TOTAL ENTRIES</p>
              </div>

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
                        <td>{log.remarks}</td>
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
