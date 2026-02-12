import React, { useState, useRef, useEffect } from "react";
import "../css/addLogModal.css";
import add from "../assets/add.png";

/* ============================================================
   ADD LOG ENTRY MODAL COMPONENT
   Modal for creating new log entries or editing existing ones
   - Supports image attachments with preview
   - Images are converted to base64 for database storage
============================================================ */
function AddLogEntryModal({ isOpen, onClose, onSave, initialData }) {
  
  /* ----------------------------------------------------------
     STATE VARIABLES
  ---------------------------------------------------------- */
  const [timeUTC, setTimeUTC] = useState(initialData?.timeUTC || "");         // Time field
  const [initials, setInitials] = useState(initialData?.initials || "");       // Personnel initials
  const [remarks, setRemarks] = useState(initialData?.remarks || "");          // Remarks/notes
  const [images, setImages] = useState([]);                                    // Array of {name, data, size}
  const [previewImage, setPreviewImage] = useState(null);                      // Image for full preview
  const fileInputRef = useRef(null);                                           // Ref for file input reset

  /* ----------------------------------------------------------
     EFFECT: Reset form when modal opens or initialData changes
     - Populates fields when editing an existing log
     - Clears fields when adding a new log
  ---------------------------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      setTimeUTC(initialData?.timeUTC || "");
      setInitials(initialData?.initials || "");
      setRemarks(initialData?.remarks || "");
      
      // Parse existing images if editing a log entry
      if (initialData?.images) {
        try {
          const parsedImages = typeof initialData.images === 'string' 
            ? JSON.parse(initialData.images) 
            : initialData.images;
          setImages(Array.isArray(parsedImages) ? parsedImages : []);
        } catch {
          setImages([]);
        }
      } else {
        setImages([]);
      }
    }
  }, [isOpen, initialData]);

  // Don't render if modal is closed
  if (!isOpen) return null;

  /* ----------------------------------------------------------
     HELPER: Convert file to base64 string
     Used for storing images in the database
  ---------------------------------------------------------- */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /* ----------------------------------------------------------
     CONSTANTS: File size limits
  ---------------------------------------------------------- */
  const MAX_FILE_SIZE_MB = 10;  // Maximum file size in MB
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;  // 10MB in bytes

  /* ----------------------------------------------------------
     HANDLER: Process selected image files
     - Validates file size (max 10MB per image)
     - Converts each image to base64
     - Adds to images array with name, data, and size
  ---------------------------------------------------------- */
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const oversizedFiles = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Check file size limit (10MB)
        if (file.size > MAX_FILE_SIZE_BYTES) {
          oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
          continue; // Skip this file
        }
        
        const base64 = await fileToBase64(file);
        newImages.push({
          name: file.name,
          data: base64,
          size: file.size >= 1024 * 1024 
            ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
            : (file.size / 1024).toFixed(2) + ' KB'
        });
      }
    }

    // Alert user about oversized files
    if (oversizedFiles.length > 0) {
      alert(`The following file(s) exceed the ${MAX_FILE_SIZE_MB}MB limit and were not added:\n\n${oversizedFiles.join('\n')}`);
    }

    setImages((prev) => [...prev, ...newImages]);
    
    // Reset file input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* ----------------------------------------------------------
     HANDLER: Remove image from the list by index
  ---------------------------------------------------------- */
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ----------------------------------------------------------
     HANDLER: Open full image preview modal
  ---------------------------------------------------------- */
  const handleViewImage = (imageData) => {
    setPreviewImage(imageData);
  };

  /* ----------------------------------------------------------
     HANDLER: Close image preview modal
  ---------------------------------------------------------- */
  const closePreview = () => {
    setPreviewImage(null);
  };

  /* ----------------------------------------------------------
     HANDLER: Submit form - Save or Update log entry
     - Packages all data including images as JSON string
     - Calls parent onSave callback (parent handles modal close on success)
  ---------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const entry = {
      // Include ID if editing (for backend to know which row to update)
      ...(initialData?.id && { id: initialData.id }), 
      timeUTC,
      initials,
      remarks,
      images: JSON.stringify(images), // Convert images array to JSON string
      timestamp: initialData?.timestamp || new Date().toISOString(),
    };

    console.log("Submitting entry with images:", entry); // Debug log
    
    // Call parent save handler - parent will close modal on success
    await onSave(entry);

    // Reset form state after successful save
    setTimeUTC("");
    setInitials("");
    setRemarks("");
    setImages([]);
  };

  /* ============================================================
     RENDER: Modal Layout
  ============================================================ */
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        {/* ====== MODAL HEADER ====== */}
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

        {/* ====== FORM BODY ====== */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Time and Initials Row */}
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

          {/* Remarks Textarea */}
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

          {/* ====== IMAGE ATTACHMENT SECTION ====== */}
          <div className="field">
            <label>Attach Images (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>

          {/* ====== ATTACHED IMAGES TABLE ======
              Displays all attached images with preview, name, size
              Actions: View full image, Remove from list
          */}
          {images.length > 0 && (
            <div className="images-table-container">
              <table className="images-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Preview</th>
                    <th>File Name</th>
                    <th>Size</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((img, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* Thumbnail - Click to view full */}
                      <td>
                        <img
                          src={img.data}
                          alt={img.name}
                          className="image-thumbnail"
                          onClick={() => handleViewImage(img.data)}
                          title="Click to view full image"
                        />
                      </td>
                      <td className="image-name">{img.name}</td>
                      <td>{img.size}</td>
                      {/* Action Buttons */}
                      <td>
                        <button
                          type="button"
                          className="view-btn"
                          onClick={() => handleViewImage(img.data)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveImage(index)}
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

          {/* ====== MODAL FOOTER - Action Buttons ====== */}
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

      {/* ====== FULL IMAGE PREVIEW MODAL ======
          Opens when user clicks View or thumbnail
          Click outside or X to close
      */}
      {previewImage && (
        <div className="image-preview-overlay" onClick={closePreview}>
          <div className="image-preview-container" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close-btn" onClick={closePreview}>
              ✕
            </button>
            <img src={previewImage} alt="Full Preview" className="full-preview-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLogEntryModal;