import React, { useState } from "react";
import "../css/addLogModal.css";

function AddLogEntryModal({ isOpen, onClose, onSave }) {
  const [facility, setFacility] = useState("");
  const [initials, setInitials] = useState("");
  const [remarks, setRemarks] = useState("");
  const [popup, setPopup] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const entry = {
      facility: facility.trim(),
      initials: initials.trim(),
      remarks: remarks.trim(),
    };

    try {
      setPopup("saving");

      // Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("http://localhost:5000/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      const data = await response.json();

      if (!response.ok) {
        setPopup(""); // hide pop-up
        alert(data.message || "Failed to save entry");
        return;
      }

      setPopup("success");

      onSave(data);

      setFacility("");
      setInitials("");
      setRemarks("");

      setTimeout(() => {
        setPopup("");
      }, 2000);
      
    } catch (err) {
      console.error("Network error:", err);
      setPopup("");
      alert("Server not reachable");
    }
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
            <strong>Note:</strong> All log entries are timestamped
            automatically. Please ensure all required information is accurate
            before submitting.
          </div>

          {/* Pop-up message */}
          {popup === "saving" && (
            <div className="popup-message saving">⏳ Saving entry...</div>
          )}
          {popup === "success" && (
            <div className="popup-message success">
              ✅ Entry successfully saved!
            </div>
          )}

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
