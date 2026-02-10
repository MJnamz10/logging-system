import React, { useState, useEffect } from "react";
import logo from "../assets/CAAP_Logo.png";
import "../css/logs.css";
import home from "../assets/home.png";
import log from "../assets/Mask group.png";
import { useLocation, useNavigate } from "react-router-dom";

function Logs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchDate, setSearchDate] = useState("Jan 28 - Jan 29, 2026");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPicker, setShowPicker] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date(2026, 0, 1)); // January 2026
  const [selectedRange, setSelectedRange] = useState({
    start: { day: 28, month: 0, year: 2026 },
    end: { day: 29, month: 0, year: 2026 },
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDayClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: { day, month, year }, end: null });
    } else {
      const startDate = new Date(
        selectedRange.start.year,
        selectedRange.start.month,
        selectedRange.start.day,
      );

      if (clickedDate < startDate) {
        setSelectedRange({ start: { day, month, year }, end: null });
      } else {
        setSelectedRange({ ...selectedRange, end: { day, month, year } });
      }
    }
  };

  const isDaySelected = (day, month, year) => {
    if (
      selectedRange.start &&
      selectedRange.start.day === day &&
      selectedRange.start.month === month &&
      selectedRange.start.year === year
    )
      return "selected-start active";
    if (
      selectedRange.end &&
      selectedRange.end.day === day &&
      selectedRange.end.month === month &&
      selectedRange.end.year === year
    )
      return "selected-end active";

    if (selectedRange.start && selectedRange.end) {
      const startDate = new Date(
        selectedRange.start.year,
        selectedRange.start.month,
        selectedRange.start.day,
      );
      const endDate = new Date(
        selectedRange.end.year,
        selectedRange.end.month,
        selectedRange.end.day,
      );
      const currentDate = new Date(year, month, day);

      if (currentDate > startDate && currentDate < endDate)
        return "in-range-bg";
    }
    return "";
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentViewDate(newDate);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="day empty"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      days.push(
        <div
          key={`day-${d}`}
          className={`day ${isDaySelected(d, month, year)}`}
          onClick={() => handleDayClick(d, month, year)}
        >
          {d}
        </div>,
      );
    }

    return (
      <div className="calendar-grid">
        <div className="weekday-header">
          <span>SU</span>
          <span>MO</span>
          <span>TU</span>
          <span>WE</span>
          <span>TH</span>
          <span>FR</span>
          <span>SA</span>
        </div>
        <div className="days-grid">{days}</div>
      </div>
    );
  };

  const applyFilter = () => {
    if (selectedRange.start && selectedRange.end) {
      const start = selectedRange.start;
      const end = selectedRange.end;
      setSearchDate(
        `${months[start.month].slice(0, 3)} ${start.day} - ${months[end.month].slice(0, 3)} ${end.day}, ${end.year}`,
      );
    } else if (selectedRange.start) {
      const start = selectedRange.start;
      setSearchDate(
        `${months[start.month].slice(0, 3)} ${start.day}, ${start.year}`,
      );
    }
    setShowPicker(false);
  };

  const nextMonthDate = new Date(currentViewDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  const [logsData, setLogsData] = useState([]);

  const filteredLogs = logsData;
  // For simplicity, if no specific filter applied besides UI state, showing all or filtered by status
  // In a real app, we'd parse log.date and compare with selectedRange

  const clearDate = () => {
    setSearchDate("");
    setSelectedRange({ start: null, end: null });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/logs");
        const data = await res.json();
        setLogsData(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, [location.pathname]); // refetch when navigating

  return (
    <div className="logs-page">
      {/* Sidebar */}
      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>
        <div className="sidebar-divider"></div>
        <div className="dash-options">
          <div className={location.pathname === "/dashboard" ? "active-item" : "item"} onClick={() => navigate("/dashboard")}>
            <img src={home} alt="icon" className="dash-icon1" /> Dashboard
          </div>
          <div className={location.pathname === "/logs" ? "active-item" : "item"} onClick={() => navigate("/logs")}>
            <img src={log} alt="icon" className="dash-icon" /> Logs
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="logs-content">
        {/* Search Bar */}
        <div className="logs-search-bar">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" placeholder="Search by date or keywords..." className="search-input" />
          </div>

          <div className="date-picker-container">
            <div
              className="date-picker"
              onClick={() => setShowPicker(!showPicker)}
            >
              <svg
                className="calendar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{searchDate}</span>
              {searchDate && (
                <button
                  className="clear-date"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDate();
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {showPicker && (
              <div className="date-range-picker-popup">
                <div className="picker-header">
                  <span>Filter by Date Range</span>
                  <button
                    className="picker-clear-btn"
                    onClick={() => setSelectedRange({ start: null, end: null })}
                  >
                    Clear
                  </button>
                </div>
                <div className="picker-months-nav">
                  <button className="nav-arrow" onClick={() => changeMonth(-1)}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <div className="month-labels">
                    <span className="month-label">
                      {months[currentViewDate.getMonth()]}{" "}
                      {currentViewDate.getFullYear()}
                    </span>
                    <span className="month-label">
                      {months[nextMonthDate.getMonth()]}{" "}
                      {nextMonthDate.getFullYear()}
                    </span>
                  </div>
                  <button className="nav-arrow" onClick={() => changeMonth(1)}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
                <div className="picker-calendars">
                  {renderCalendar(currentViewDate)}
                  {renderCalendar(nextMonthDate)}
                </div>
                <button className="apply-filter-btn" onClick={applyFilter}>
                  Apply Filter
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="logs-count">Showing {filteredLogs.length} logs</div>

        {/* Logs List */}
        <div className="logs-list">
          {filteredLogs.map((logItem, index) => {
            const logDate = new Date(logItem.timestamp);

            return (
              <div key={logItem._id || index} className="log-group">
                <div className="log-date-header">
                  <svg
                    className="calendar-small-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>

                  <span className="log-date">
                    {logDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                  </span>

                  <span className="log-day">
                    {logDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      timeZone: "UTC",
                    })}
                  </span>

                  <div className="date-line"></div>
                </div>

                <div className="log-card">
                  <div className="log-card-content">
                    <div className="status-badge open">Open</div>

                    <div className="log-updated">
                      Last updated{" "}
                      {logDate.toLocaleTimeString("en-GB", {
                        timeZone: "UTC",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="log-details">
                    <strong>
                      {logItem.facility} {logItem.initials}
                    </strong>
                    <p>{logItem.remarks}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button className="page-btn nav-btn" disabled>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          {[1,2,3,4,5].map((page) => (
            <button key={page} className={`page-btn ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)}>{page}</button>
          ))}
          <button className="page-btn nav-btn">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logs;

