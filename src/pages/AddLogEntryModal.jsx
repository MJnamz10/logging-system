import React, { useState } from "react";
import "../css/addLogModal.css";
import add from "../assets/add.png";

// Added initialData to props
function AddLogEntryModal({ isOpen, onClose, onSave, initialData }) {
  // Initialize state directly from initialData (if editing) or empty (if adding)
  const [timeUTC, setTimeUTC] = useState(initialData?.timeUTC || "");
  const [initials, setInitials] = useState(initialData?.initials || "");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [images, setImages] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const entry = {
      // 🔥 CRITICAL: Include the ID so the backend knows which row to update
      ...(initialData?.id && { id: initialData.id }), 
      timeUTC,
      initials,
      remarks,
      images,
      timestamp: initialData?.timestamp || new Date().toISOString(),
    };

    onSave(entry);
    onClose();

    // Reset local state
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
            <p>{initialData ? "Update the information below" : "Record a new event, incident, or note"}</p>
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
              <label>Time *</label>
              <input
                type="text"
                required
                value={timeUTC}
                onChange={(e) => setTimeUTC(e.target.value)}
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