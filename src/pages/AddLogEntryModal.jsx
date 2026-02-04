import React, { useState } from "react";
import "../css/addLogModal.css";
import add from "../assets/add.png";
function AddLogEntryModal({ isOpen, onClose, onSave }) {
  const [facility, setFacility] = useState("");
  const [initials, setInitials] = useState("");
  const [remarks, setRemarks] = useState("");
  const [images, setImages] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const entry = {
      facility,
      initials,
      remarks,
      images,
      timestamp: new Date().toISOString(),
    };

    onSave(entry);
    onClose();

    setFacility("");
    setInitials("");
    setRemarks("");
    setImages([]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3>Add Log Entry</h3>
            <p>Record a new event, incident, or note</p>
          </div>
          <div className="add-icon-container">
            <img src={add} alt="add-icon" className="add-icon" />
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="row">
            <div className="field">
              <label>Facility *</label>
              <input
                required
                placeholder="e.g. LAGUINDINGAN "
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

          <div className="note">
            <strong>Note:</strong><br /> 
              All log entries are timestamped
              automatically. Please ensure all required information is accurate
              before submitting.
          </div>

          {/* Footer */}
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
