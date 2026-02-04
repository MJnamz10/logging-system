import React, { useState } from "react";
import "../css/addLogModal.css";

function AddLogEntryModal({ isOpen, onClose, onSave }) {
  const [facility, setFacility] = useState("");
  const [initials, setInitials] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const entry = {
      facility: facility.trim(),
      initials: initials.trim(),
      remarks: remarks.trim(),
    };

    try {
      const response = await fetch("http://localhost:5000/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to save entry");
        return;
      }

      onSave(data);
      onClose();

      setFacility("");
      setInitials("");
      setRemarks("");
    } catch (err) {
      console.error("Network error:", err);
      alert("Server not reachable");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3>Add Log Entry</h3>
            <p>Record a new event, incident, or note</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="row">
            <div className="field">
              <label>Facility *</label>
              <input
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Personnel Initials *</label>
              <input
                required
                placeholder="e.g. KS RC GP JD"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Entry Remarks *</label>
            <textarea
              required
              rows="4"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLogEntryModal;
