import React from "react";
import logo from "../assets/CAAP_logo.png";
import "../css/logs.css";
import home from "../assets/home.png";
import log from "../assets/Mask group.png";
import { useLocation, useNavigate } from "react-router-dom";

function Logs() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="logs-page">
      <div className="logs-header"></div>
      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>

        <div className="dash-options">
          <div
            className={
              location.pathname === "/dashboard" ? "active-item" : "item"
            }
            onClick={() => navigate("/dashboard")}
          >
            <img src={home} alt="icon" className="dash-icon1" />
            Dashboard
          </div>

          <div
            className={location.pathname === "/logs" ? "active-item" : "item"}
            onClick={() => navigate("/logs")}
          >
            <img src={log} alt="icon" className="dash-icon" />
            <h className="logs">Logs</h>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
