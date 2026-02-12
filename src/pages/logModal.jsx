import React, { useState } from 'react';
import '../css/logModal.css';


/**
 * LogModal Component
 * 
 * PURPOSE: Displays a detailed view of all log entries for a specific day
 * TRIGGER: Opens when user clicks "View Full Table" button in logs.jsx
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback function to close the modal
 * @param {object} data - Contains date string and array of log entries for the selected day
 *                        Structure: { date: "Jan 28, 2026", logs: [...] }
 */
const LogModal = ({ isOpen, onClose, data }) => {
  // STATE: Search term for filtering log entries by initials or remarks
  const [searchTerm, setSearchTerm] = useState('');

  // GUARD CLAUSE: Prevent rendering if modal is closed or no data provided
  if (!isOpen || !data) return null;

  /**
   * FILTER LOGIC: Real-time search functionality
   * - Searches through both 'initials' and 'remarks' fields
   * - Case-insensitive matching
   * - Returns all logs if search term is empty
   */
  const filteredLogs = data.logs.filter((log) => {
    if (!searchTerm.trim()) return true;
    return (
      log.initials?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  /**
   * ACTION: Print Report Handler
   * TRIGGER: When user clicks "Print Report" button
   * BEHAVIOR: Fetches PDF from backend and opens it in new tab for printing
   */
  const handlePrintReport = async () => {
    try {
      // Get the date from the first log to filter the PDF
      const firstLog = data.logs[0];
      if (!firstLog) return;
      
      const logDate = new Date(firstLog.timestamp).toISOString().slice(0, 10);
      
      // Fetch PDF from backend filtered by date
      const response = await fetch(`http://localhost:5000/logs/export/pdf?from=${logDate}&to=${logDate}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Open PDF in new tab for viewing/printing
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    }
  };

  /**
   * DATE FORMATTING: Compute the full weekday + date string for header display
   * Uses the first log's timestamp to derive the actual date with weekday
   * Example output: "Wednesday, January 28, 2026"
   */
  const firstLog = data.logs[0];
  const fullDateString = firstLog
    ? new Date(firstLog.timestamp).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      })
    : data.date;

  return (
    // OVERLAY: Dark background that closes modal when clicked
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-log" 
        // PREVENT PROPAGATION: Stops clicks inside modal from closing it
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================== HEADER SECTION (single unified blue block) ==================== */}
        <div className="log-modal-header">

          {/* TOP ROW: Title, Search Bar, Status Badge, Back Arrow */}
          <div className="header-top-row">

            {/* LEFT: Icon + Title */}
            <div className="header-left">
              {/* ICON: Document/File icon for visual context */}
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              {/* TITLE GROUP: Main heading and subtitle */}
              <div className="header-title-group">
                <h2>Log Entries</h2>
                <p className="header-subtitle">Air Navigation Service</p>
              </div>
            </div>

            {/* CENTER: Search Bar */}
            <div className="header-search">
              {/* SEARCH ICON */}
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              {/* 
                SEARCH INPUT
                ACTION: Real-time filtering of log entries
                TRIGGER: onChange event on every keystroke
                BEHAVIOR: Updates searchTerm state which triggers filteredLogs recalculation
                SEARCHES: Both 'initials' and 'remarks' fields (case-insensitive)
              */}
              <input
                type="text"
                placeholder="Search by initals or keywords..."
                className="log-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* RIGHT: Status Badge + Back Arrow */}
            <div className="header-right">
              <button className="back-arrow" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* DATE ROW: Full weekday + date below the title */}
          <div className="header-date-row">
            {/* CLOCK ICON */}
            <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {/* DATE DISPLAY: Full date string e.g. "Wednesday, January 28, 2026" */}
            <span className="header-date">{fullDateString}</span>
          </div>

          {/* ENTRY COUNT ROW: Total entries count at bottom-left of header */}
          <div className="header-count-row">
            {/* 
              DYNAMIC COUNT DISPLAY
              LOGIC: Shows filtered count if search is active, otherwise shows total count
              UPDATES: Automatically when searchTerm changes
            */}
            <span className="count-number">{filteredLogs.length}</span>
            <span className="count-label">TOTAL ENTRIES</span>
          </div>
        </div>

        {/* ==================== TABLE SECTION ==================== */}
        <div className="log-modal-body">
          <table className="log-entries-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Remarks</th>
                <th>Initals</th>
              </tr>
            </thead>
            <tbody>
              {/* 
                TABLE ROWS: Dynamic rendering of filtered log entries
                DATA SOURCE: filteredLogs array (filtered by searchTerm)
                LOGIC: Date only shown on first row; subsequent same-day rows leave date empty
              */}
              {filteredLogs.map((log, i) => {
                // DATE FORMATTING: Convert ISO timestamp to MM/DD/YY format
                const logDate = new Date(log.timestamp);
                const formattedDate = logDate.toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: '2-digit',
                  timeZone: 'UTC'
                });

                return (
                  <tr key={log.id || i}>
                    {/* DATE COLUMN: Only show date on first row to avoid repetition */}
                    <td className={i === 0 ? 'date-col-bold' : 'date-col'}>
                      {i === 0 ? formattedDate : ''}
                    </td>
                    
                    {/* TIME COLUMN: Shows time in HHMM format (from log.timeUTC) */}
                    <td className="time-col">{log.timeUTC}</td>
                    
                    {/* REMARKS COLUMN: Shows log entry description/notes */}
                    <td className="remarks-col">{log.remarks}</td>
                    
                    {/* INITIALS COLUMN: Shows user initials who created the entry */}
                    <td>{log.initials}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ==================== FOOTER SECTION ==================== */}
        <div className="log-modal-footer">
          {/* INFO TEXT: Indicates that all entries for selected day are displayed */}
          <span className="footer-info">Showing all entries for this day</span>
          
          <div className="footer-buttons">
            {/* 
              PRINT REPORT BUTTON
              ACTION: Opens browser print dialog to print the modal content
              TRIGGER: onClick event
              BEHAVIOR: Calls window.print() to generate printable version
              USE CASE: For physical/PDF record keeping
            */}
            <button className="print-btn" onClick={handlePrintReport}>
              Print Report
            </button>
            
            {/* 
              CLOSE BUTTON
              ACTION: Closes the modal and returns to logs page
              TRIGGER: onClick event
              BEHAVIOR: Calls onClose() callback passed from parent (logs.jsx)
              RESULT: Sets selectedDayLogs to null in parent, hiding modal
            */}
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogModal;