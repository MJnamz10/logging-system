import React, { useState } from "react";
import "../css/addDPOREntryModal.css"; // Reuse modal styles from dashboard

function AddDPOREntryModal({ onClose, onSave, initialData }) {
  // Helpers for today's date format yyyy-mm-dd
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize state: use initialData if editing, otherwise use defaults
  const [formData, setFormData] = useState({
    report_date: initialData?.report_date || today,
    dpor_for: initialData?.dpor_for || today,
    operational_remarks: initialData?.operational_remarks || "",
    staff_on_ot: initialData?.staff_on_ot || "",
    personnel_count: initialData?.personnel_count || "",
    signatory: initialData?.signatory || "ANS FIC",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If we are editing, make sure to pass the 'id' back to DPOR.jsx
    if (initialData?.id) {
      onSave({ ...formData, id: initialData.id });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="dpor-modal-overlay">
      <div className="dpor-modal-content" style={{ width: "600px" }}>
        <div className="dpor-modal-header">
          {/* Change title dynamically */}
          <h2>{initialData ? "Edit DPOR Entry" : "New DPOR Entry"}</h2>
          <button className="dpor-close-btn" type="button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="dpor-modal-form">
            
            <div className="dpor-form-row">
                <div className="dpor-form-group half">
                    <label>Report Date</label>
                    <input 
                        type="date" 
                        name="report_date" 
                        value={formData.report_date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="dpor-form-group half">
                    <label>DPOR For (Date)</label>
                    <input 
                        type="date" 
                        name="dpor_for" 
                        value={formData.dpor_for} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
            </div>

            <div className="dpor-form-group">
                <label>Operational Remarks</label>
                <textarea
                    name="operational_remarks"
                    rows="4"
                    placeholder="e.g. ILS on Single System; HF 4100 Transceivers Out..."
                    value={formData.operational_remarks}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>

            <div className="dpor-form-group">
                <label>Staff on OT</label>
                <input
                    type="text"
                    name="staff_on_ot"
                    placeholder="e.g. CNSSO 1 R. CARTAGENA"
                    value={formData.staff_on_ot}
                    onChange={handleChange}
                />
            </div>

            <div className="dpor-form-group">
                <label>Personnel Count</label>
                <input
                    type="text"
                    name="personnel_count"
                    placeholder="e.g. 10 CNSSO, 6 ALPTS, 7 JO"
                    value={formData.personnel_count}
                    onChange={handleChange}
                />
            </div>

            <div className="dpor-form-group">
                <label>Signatory</label>
                <input
                    type="text"
                    name="signatory"
                    value={formData.signatory}
                    onChange={handleChange}
                />
            </div>

            <div className="dpor-modal-actions">
                <button type="button" className="dpor-cancel-btn" onClick={onClose}>Cancel</button>
                {/* Change button text dynamically */}
                <button type="submit" className="dpor-save-btn">
                  {initialData ? "Update Entry" : "Save Entry"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default AddDPOREntryModal;