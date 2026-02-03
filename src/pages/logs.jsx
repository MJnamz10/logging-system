import React, { useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import "../css/logs.css";
import home from "../assets/home.png";
import log from "../assets/Mask group.png";
import { useLocation, useNavigate } from "react-router-dom";

function Logs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchDate, setSearchDate] = useState("Jan 28, 2026");
  const [currentPage, setCurrentPage] = useState(1);

  const logsData = [
    {
      id: 1,
      date: "Today",
      dayName: "Wednesday",
      status: "Open",
      entries: 8,
      incidents: 1,
      maintenance: 4,
      safety: 2,
      lastUpdated: "1:01 PM",
    },
    {
      id: 2,
      date: "Yesterday",
      dayName: "Tuesday",
      status: "Closed",
      entries: 7,
      incidents: 0,
      maintenance: 4,
      safety: 2,
      lastUpdated: "1:16 PM",
    },
    {
      id: 3,
      date: "Jan 26, 2026",
      dayName: "Monday",
      status: "Closed",
      entries: 7,
      incidents: 0,
      maintenance: 4,
      safety: 2,
      lastUpdated: "1:16 PM",
    },
  ];

  const clearDate = () => {
    setSearchDate("");
  };

  return (
    <div className="logs-page">
      <div className="logs-header"></div>
      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>
        <div className="sidebar-divider"></div>
        <div className="dash-options">
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
            <img src={log} alt="icon" className="dash-icon" />
            <h className="logs">Logs</h>
          </div>
        </div>
      </div>

      <div className="logs-content">
        <div className="logs-search-bar">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by date or keywords..."
              className="search-input"
            />
          </div>
          <div className="date-picker">
            <svg className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{searchDate}</span>
            {searchDate && (
              <button className="clear-date" onClick={clearDate}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="logs-filters">
          <div className="filter-group">
            <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span className="filter-label">Status:</span>
            <button
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${statusFilter === "open" ? "active" : ""}`}
              onClick={() => setStatusFilter("open")}
            >
              Open
            </button>
            <button
              className={`filter-btn ${statusFilter === "closed" ? "active" : ""}`}
              onClick={() => setStatusFilter("closed")}
            >
              Closed
            </button>
          </div>
        </div>

        <div className="logs-count">Showing 8 logs</div>

        <div className="logs-list">
          {logsData.map((logItem) => (
            <div key={logItem.id} className="log-group">
              <div className="log-date-header">
                <svg className="calendar-small-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className="log-date">{logItem.date}</span>
                <span className="log-day">{logItem.dayName}</span>
                <div className="date-line"></div>
              </div>

              <div className="log-card">
                <div className="log-card-content">
                  <div className={`status-badge ${logItem.status.toLowerCase()}`}>
                    {logItem.status === "Open" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    )}
                    {logItem.status}
                  </div>
                  <div className="log-stats">
                    <span>{logItem.entries} entries</span>
                    <span className="dot">•</span>
                    <span>{logItem.incidents} incidents</span>
                    <span className="dot">•</span>
                    <span>{logItem.maintenance} maintenance</span>
                    <span className="dot">•</span>
                    <span>{logItem.safety} safety</span>
                  </div>
                  <div className="log-updated">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Last updated {logItem.lastUpdated}
                  </div>
                </div>
                <div className="log-card-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button className="page-btn nav-btn" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          {[1, 2, 3, 4, 5].map((page) => (
            <button
              key={page}
              className={`page-btn ${currentPage === page ? "active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button className="page-btn nav-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logs;
