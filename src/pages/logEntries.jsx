import React, { useState } from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import log from "../assets/Mask group.png";
import { useNavigate } from "react-router-dom";
import { FileText, Clock, ArrowLeft, Pencil, Trash2, Search, X } from "lucide-react";
import "../css/logEntries.css";

const mockLogs = [
  { date: "01/28/26", time: "0000", remarks: "Caixa plástica de 20L com tampa e alças laterais", initials: "Distribuidora Alfa" },
  { date: "", time: "0100", remarks: "Caixa plástica de 20L com tampa e alças laterais", initials: "Distribuidora Alfa" },
  { date: "", time: "0200", remarks: "Caixa plástica de 20L com tampa e alças laterais", initials: "Distribuidora Alfa" },
  { date: "", time: "0300", remarks: "Caixa plástica de 20L com tampa e alças laterais", initials: "Distribuidora Alfa" },
  { date: "", time: "0400", remarks: "Caixa plástica de 20L com tampa e alças laterais", initials: "Distribuidora Alfa" },
];

function LogEntries() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState(mockLogs);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ date: "", time: "", remarks: "", initials: "" });

  // Open modal with pre-filled data
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...logs[index] });
    setIsModalOpen(true);
  };

  // Save changes from modal
  const saveEdit = () => {
    const newLogs = [...logs];
    newLogs[editIndex] = { ...editData };
    setLogs(newLogs);
    setIsModalOpen(false);
    setEditIndex(null);
  };

  // Delete log entry
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this log?")) {
      const newLogs = [...logs];
      newLogs.splice(index, 1);
      setLogs(newLogs);
    }
  };

  return (
    <div className="logs-page">
      {/* ===== SIDEBAR ===== */}
      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>

        <div className="sidebar-divider"></div>

        <div className="dash-options">
          <div className="item" onClick={() => navigate("/dashboard")}>
            <img src={home} alt="Dashboard" className="dash-icon" />
            Dashboard
          </div>

          <div className="active-item">
            <img src={log} alt="Logs" className="dash-icon" />
            Logs
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="logs-content">
        {/* Header */}
        <div className="header-section">
          <div className="header-left">
            <div className="icon-bg">
              <FileText className="icon" />
            </div>
            <div>
              <h1 className="title">Log Entries</h1>
              <p className="service-name">Air Navigation Service</p>
              <div className="date-info">
                <Clock className="clock-icon" />
                <span>Wednesday, January 28, 2026</span>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="search-box">
              <Search className="search-icon" />
              <input type="text" placeholder="Search by initials or keywords..." />
            </div>
          </div>

          <div className="header-right">
            <div className="status-box">
              <div className="status-dot"></div>
              <div>
                <span className="status-label">Log Status</span>
                <span className="status-value"> OPEN </span>
              </div>
            </div>
            <button className="back-button" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="icon" />
            </button>
          </div>
        </div>

        {/* Total Entries */}
        <div className="total-entries">
          <span>{logs.length}</span>
          <span>Total Entries</span>
        </div>

        {/* Table */}
        <div className="table-section">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Remarks</th>
                <th>Initials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>{entry.remarks}</td>
                  <td>{entry.initials}</td>
                  <td className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(idx)}>
                      <Pencil className="action-icon" />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(idx)}>
                      <Trash2 className="action-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="table-footer">
            <button className="print-btn">Print Report</button>
            <button className="close-btn">Close</button>
          </div>
        </div>
      </div>

      {/* ===== Edit Modal ===== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Log Entry</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
            </div>
            <div className="modal-body">
              <label>
                Date:
                <input
                  type="text"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                />
              </label>
              <label>
                Time:
                <input
                  type="text"
                  value={editData.time}
                  onChange={(e) => setEditData({ ...editData, time: e.target.value })}
                />
              </label>
              <label>
                Remarks:
                <input
                  type="text"
                  value={editData.remarks}
                  onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                />
              </label>
              <label>
                Initials:
                <input
                  type="text"
                  value={editData.initials}
                  onChange={(e) => setEditData({ ...editData, initials: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="print-btn" onClick={saveEdit}>Save</button>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogEntries;
