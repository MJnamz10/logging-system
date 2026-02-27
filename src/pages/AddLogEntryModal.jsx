import React, { useState, useRef } from "react";
import "../css/addLogModal.css";
import add from "../assets/add.png";

/* ============================================================
   ADD LOG ENTRY MODAL COMPONENT
   Note: To ensure state resets correctly when switching between 
   entries, wrap this component in a unique 'key' in the parent.
============================================================ */
function AddLogEntryModal({ isOpen, onClose, onSave, initialData }) {
  // 1. HELPER: Parse initial images safely
  const getInitialImages = () => {
    if (!initialData?.images) return [];
    try {
      return typeof initialData.images === "string"
        ? JSON.parse(initialData.images)
        : initialData.images;
    } catch (e) {
      console.error("Failed to parse initial images", e);
      return [];
    }
  };

  // 2. STATE: Initialized directly from props (no useEffect needed)
  const [timeUTC, setTimeUTC] = useState(initialData?.timeUTC || "");
  const [initials, setInitials] = useState(initialData?.initials || "");
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [images, setImages] = useState(getInitialImages);
  const [previewImage, setPreviewImage] = useState(null);
  const [daysup, setDay] = useState(initialData?.daysup || "");
  const [nightsup, setNight] = useState(initialData?.nightsup || "");

  const fileInputRef = useRef(null);


  if (!isOpen) return null;

  /* ----------------------------------------------------------
     HANDLERS
  ---------------------------------------------------------- */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const files = Array.from(e.target.files);
    const newImages = [];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        if (file.size > MAX_SIZE) {
          alert(`${file.name} exceeds the 10MB limit.`);
          continue;
        }

        const base64 = await fileToBase64(file);
        newImages.push({
          name: file.name,
          data: base64,
          size:
            file.size >= 1048576
              ? (file.size / 1048576).toFixed(2) + " MB"
              : (file.size / 1024).toFixed(2) + " KB",
        });
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic requirement check since it's a custom text input now
    if (timeUTC.length < 5) {
      alert("Please enter a valid time (HH:mm)");
      return;
    }
    // Package data
    const entry = {
      ...(initialData?.id && { id: initialData.id }),
      timeUTC,
      initials,
      remarks,
      daysup,
      nightsup,
      images: JSON.stringify(images),
      timestamp: initialData?.timestamp || new Date().toISOString(),
    };

    onSave(entry);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3>{initialData?.id ? "Edit Log Entry" : "Add Log Entry"}</h3>
            <p>
              {initialData?.id
                ? "Update the information below"
                : "Record a new event or note"}
            </p>
          </div>
          <div className="add-icon-container">
            <img src={add} alt="add" className="add-icon" />
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
                className="time-input"
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
              <input
                required
                placeholder="e.g. JD"
                value={initials}TEST
                onChange={(e) => setInitials(e.target.value)}
              />
            </div>
          </div>
          <div className="row2">
            <div className="field2">
              <label>Day Shift Supervisor </label>
              <input
                type="text"
                value={daysup}
                onChange={(e) => setDay(e.target.value)}
                
              />
            </div>

            <div className="field2">
            <label>Eve-Mid Shift Supervisor </label>
            <input
              type="text"
              value={nightsup}
              onChange={(e) => setNight(e.target.value)}
            />
          </div>
          </div>
          <div className="field">
            <label>Entry Remarks *</label>
            <textarea
              required
              rows="8"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Attach Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {images.length > 0 && (
            <div className="images-table-container">
              <table className="images-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Preview</th>
                    <th>File Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <img
                          src={img.data}
                          className="image-thumbnail"
                          onClick={() => setPreviewImage(img.data)}
                          alt="thumb"
                        />
                      </td>
                      <td className="image-name">{img.name}</td>
                      <td>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {initialData?.id ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>

      {/* Full Image Preview */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="image-preview-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="preview-close-btn"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="full-preview-image"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLogEntryModal;
