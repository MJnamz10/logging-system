import React, { useEffect, useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import logIcon from "../assets/Mask group.png";
import clock from "../assets/clock-bold.svg";
import add from "../assets/add.png";
import exp from "../assets/export.png";
import search from "../assets/search.png";
import viewlogs from "../assets/viewlogs.png";
import "../css/dashboard.css";
import AddLogEntryModal from "./AddLogEntryModal";
import { useLocation, useNavigate } from "react-router-dom";

function Dashboard({ latestLogs, setLatestLogs }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());
  const [showAddLog, setShowAddLog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH ALL LOGS
  useEffect(() => {
    const fetchAllLogs = async () => {
      const res = await fetch("http://localhost:5000/logs");
      const data = await res.json();
      setLatestLogs(data);
    };

    fetchAllLogs();
  }, [setLatestLogs]);

  // CLOCK
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

const handleExportPdf = async () => {
  try {
    const response = await fetch("http://localhost:5000/logs/export/pdf");

    if (!response.ok) {
      const errText = await response.text(); // might be JSON or HTML
      console.error("Export failed:", response.status, errText);
      alert(`Failed to export PDF (HTTP ${response.status})`);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export error:", err);
    alert("Failed to export PDF");
  }
};


  // SAVE LOG
  const handleSaveLog = async (entry) => {
    const res = await fetch("http://localhost:5000/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    const savedLog = await res.json();
    setLatestLogs((prev) => [savedLog, ...prev]);
    setShowAddLog(false);
  };

  // FILTER LOGS
  const filteredLogs = latestLogs.filter((log) => {
    if (!searchTerm.trim()) return true;

    return (
      log.timeUTC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.initials.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.remarks.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
              <img src={clock} alt="clock-icon" className="clock-icon" />
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
                  <img src={add} alt="add-icon" className="add-icon" />
                </div>
              </button>
              <button className="action" onClick={handleExportPdf}>
                <p className="action-text1">Export PDF</p>
                <p className="action-text2">Download log as PDF report</p>
                <div className="export-container">
                  <img src={exp} alt="export-icon" className="export-icon" />
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
                <img src={viewlogs} alt="icon" className="viewlogs-icon" />
              </div>
              <p className="entries-count">
                {filteredLogs.length}{" "}
              </p>
              <p className="total">
                TOTAL ENTRIES
              </p>

              <div className="table-controls">
                <span>
                  <img src={search} alt="icon" className="search-symbol" />
                </span>
                <input
                  type="text"
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
                    <th></th>
                    <th>Date</th>
                    <th>Time (UTC)</th>
                    <th>Initials</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr className="texts-two" key={log.id || index}>
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

      <AddLogEntryModal
        isOpen={showAddLog}
        onClose={() => setShowAddLog(false)}
        onSave={handleSaveLog}
      />
    </div>
  );
}

export default Dashboard;
