import React, { useEffect, useState, useMemo } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import logIcon from "../assets/Mask group.png";
import clock from "../assets/clock-bold.svg";
import add from "../assets/add.png";
import search from "../assets/search-icon.png";
import del from "../assets/delete.png";
import edit from "../assets/edit.png";
import "../css/dashboard.css"; 
import AddDPOREntryModal from "./AddDPOREntryModal";
import { useLocation, useNavigate } from "react-router-dom";

// Import pdf for direct downloading
import { pdf } from "@react-pdf/renderer";
import DPORPdfDocument from "./DPORPdfDocument";

function DPOR() {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [dateTime, setDateTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [dporEntries, setDporEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State to track the entry currently being edited
  const [editingEntry, setEditingEntry] = useState(null); 

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Effect
  useEffect(() => {
    fetch("http://localhost:5001/dpor")
      .then((res) => res.json())
      .then((data) => setDporEntries(data))
      .catch((err) => console.error("Error fetching DPOR:", err));
  }, []);

  // Save Handler (Create)
  const handleSaveDPOR = async (entry) => {
    try {
      const res = await fetch("http://localhost:5001/dpor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        const saved = await res.json();
        setDporEntries([saved, ...dporEntries]);
        setShowModal(false);
      } else {
        alert("Failed to save entry");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  // Update Handler (Edit)
  const handleUpdateDPOR = async (updatedEntry) => {
    if (!updatedEntry.id) return;

    try {
      const res = await fetch(`http://localhost:5001/dpor/${updatedEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEntry),
      });

      if (res.ok) {
        const data = await res.json();
        setDporEntries((prev) =>
          prev.map((item) => (item.id === updatedEntry.id ? { ...item, ...data } : item))
        );
        setEditingEntry(null); // Close modal on success
      } else {
        alert("Failed to update entry");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  // Delete Handler
  const handleDeleteDPOR = async (id) => {
    if (!window.confirm("Are you sure you want to delete this DPOR entry?")) return;

    try {
      const res = await fetch(`http://localhost:5001/dpor/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDporEntries((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete entry");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  // Generate and download the PDF directly
  const handleDownloadPdf = async () => {
    try {
      // 1. Generate the PDF as a blob
      const blob = await pdf(<DPORPdfDocument data={filteredEntries} />).toBlob();
      
      // 2. Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // 3. Create a temporary anchor element and trigger the download
      const link = document.createElement("a");
      link.href = url;
      
      // Give it a nice filename with today's date
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `DPOR-Report-${dateStr}.pdf`;
      
      // Click it and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  
  // Filter Logic wrapped in useMemo
  const filteredEntries = useMemo(() => {
    return dporEntries.filter((item) => {
      if (!searchTerm) return true;
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.operational_remarks?.toLowerCase().includes(lowerSearch) ||
        item.signatory?.toLowerCase().includes(lowerSearch) ||
        item.report_date?.includes(lowerSearch)
      );
    });
  }, [dporEntries, searchTerm]);

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
            className={location.pathname === "/dashboard" ? "active-item" : "item"}
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
            className={location.pathname === "/summary" ? "active-item" : "item"}
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
            <h className="header-title">Daily Performance Report</h>
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
              
              {/* Add DPOR Entry Button */}
              <button className="action" onClick={() => setShowModal(true)}>
                <p className="action-text1">Add DPOR Entry</p>
                <p className="action-text2">Create a new Daily Report</p>
                <div className="add-container">
                  <img src={add} alt="add" className="add-icon" />
                </div>
              </button>

              {/* Download PDF Report Button (THIS WAS STEP 3) */}
              <button className="action" onClick={handleDownloadPdf}>
                <p className="action-text1">Download PDF</p>
                <p className="action-text2">Save report to your device</p>
                <div className="view-container" style={{ backgroundColor: '#4649ff', width: '35px', height: '35px', borderRadius: '10px', position: 'relative', bottom: '83px', left: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
              </button>

            </div>
          </div>

          {/* ====== LOG ENTRIES TABLE ====== */}
          <div className="entry-container">
            <div className="table-header">
              <h className="entry-text">
                DPOR Summary
                <span className="entry-text2">Operational Status</span>
              </h>
              <div className="viewlogs-icon-container">
                <svg className="viewlogs-icon" width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2 H14 L19 7 V20 A2 2 0 0 1 17 22 H6 A2 2 0 0 1 4 20 V4 A2 2 0 0 1 6 2 Z" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M14 2 V7 H19" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M8 12 H15" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  <path d="M8 16 H15" stroke="white" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              
              <div className="entries-wrapper">
                <p className="entries-count">{filteredEntries.length} </p>
                <p className="total">TOTAL ENTRIES</p>
              </div>

              <div className="table-controls">
                <img src={search} alt="search" className="search-symbol" />
                <input
                  className="search-input"
                  placeholder="Search remarks, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container">
              {filteredEntries.length > 0 ? (
                <table className="logs-table">
                  <thead>
                    <tr className="texts">
                      <th>Date</th>
                      <th>DPOR For</th>
                      <th>Operational Remarks</th>
                      <th>Staff on OT</th>
                      <th>Personnel Count</th>
                      <th>Signatory</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((row, index) => (
                      <tr className="texts-two" key={row.id || index}>
                        <td>{row.report_date}</td>
                        <td>{row.dpor_for}</td>
                        <td className="remarks">{row.operational_remarks}</td>
                        <td>{row.staff_on_ot}</td>
                        <td>{row.personnel_count}</td>
                        <td>{row.signatory}</td>
                        <td className="actions-icons">
                          <button
                            className="icon-btn edit-btn"
                            onClick={() => setEditingEntry(row)}
                            title="Edit entry"
                          >
                            <img src={edit} alt="edit" />
                          </button>

                          <button
                            className="icon-btn delete-btn"
                            onClick={() => handleDeleteDPOR(row.id)}
                            title="Delete entry"
                          >
                            <img src={del} alt="delete" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-entry">No DPOR entries found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit DPOR Entry Modal */}
      {(showModal || !!editingEntry) && (
        <AddDPOREntryModal
          key={editingEntry ? `edit-${editingEntry.id}` : "add-new"}
          initialData={editingEntry}
          onClose={() => {
            setShowModal(false);
            setEditingEntry(null);
          }}
          onSave={editingEntry ? handleUpdateDPOR : handleSaveDPOR}
        />
      )}

    </div>
  );
}

export default DPOR;