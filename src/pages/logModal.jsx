import React from 'react';
import '../css/logs.css'; // Assuming your CSS is in this path

const LogModal = ({ isOpen, onClose, data }) => {
  // If modal is not open or there is no data, render nothing
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the table
      >
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon-wrapper">
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h3>Daily Activity Detail</h3>
              <p className="modal-subtitle">{data.date}</p>
            </div>
          </div>
          <button className="close-modal-x" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="table-responsive">
            <table className="modal-logs-table">
              <thead>
                <tr>
                  <th>Time (UTC)</th>
                  <th>Initials</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log, i) => (
                  <tr key={log.id || i}>
                    <td className="time-cell">
                      {log.timeUTC}
                    </td>
                    <td className="user-cell">
                      <span className="user-badge">{log.initials}</span>
                    </td>
                    <td className="remarks-cell">{log.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-close-btn" onClick={onClose}>
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogModal;