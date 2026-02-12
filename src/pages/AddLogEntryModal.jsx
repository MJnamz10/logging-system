import React, { useState } from "react";
import "../css/addLogModal.css";
import add from "../assets/add.png";

function AddLogEntryModal({ isOpen, onClose, onSave, initialData }) {
  // Use timeUTC as the single source of truth for the clock input
  const [timeUTC, setTimeUTC] = useState(initialData?.timeUTC || "");
  const [initials, setInitials] = useState(initialData?.initials || "");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [images, setImages] = useState([]);

  if (!isOpen) return null;

  // Masked 24-hour input logic
  const handleTimeChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    if (val.length >= 3) {
      val = `${val.slice(0, 2)}:${val.slice(2, 4)}`;
    }

    const [hh, mm] = val.split(":");
    // Validate bounds: Hours < 24, Minutes < 60
    if (hh && parseInt(hh) > 23) return;
    if (mm && parseInt(mm) > 59) return;

    setTimeUTC(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic requirement check since it's a custom text input now
    if (timeUTC.length < 5) {
      alert("Please enter a valid time (HH:mm)");
      return;
    }

    const entry = {
      ...(initialData?.id && { id: initialData.id }),
      timeUTC,
      initials,
      remarks,
      images,
      timestamp: initialData?.timestamp || new Date().toISOString(),
    };

    onSave(entry);
    onClose();

    // Reset fields
    setTimeUTC("");
    setInitials("");
    setRemarks("");
    setImages([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3>{initialData ? "Edit Log Entry" : "Add Log Entry"}</h3>
            <p>
              {initialData
                ? "Update the information below"
                : "Record a new event, incident, or note"}
            </p>
          </div>
          <div className="add-icon-container">
            <img src={add} alt="add-icon" className="add-icon" />
          </div>
          <button className="close-btn" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="row">
            <div className="field">
              <label>Time (UTC) *</label>
              <input className="time-input"
                type="text"
                required
                placeholder="00:00"
                value={timeUTC}
                onChange={handleTimeChange}
                maxLength="5"
                inputMode="numeric" 
              />
            </div>

            <div className="field">
              <label>Personnel Initials *</label>
              <input className="personnel-input"
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
              rows="10"
              placeholder="Describe the event, incident, or note in detail..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Attach Images (Optional)</label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages([...e.target.files])}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {initialData ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddLogEntryModal;
