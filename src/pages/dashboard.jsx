import React from "react";
import logo from "../assets/CAAP_Logo.png";
import home from "../assets/home.png";
import log from "../assets/Mask group.png";
import clock from "../assets/clock-bold.svg";
import add from "../assets/add.png";
import exp from "../assets/export.png";
import view from "../assets/view.png";
import "../css/dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dash-header"></div>
      <div className="dashboard-container">
        <div className="title-container">
          <img src={logo} alt="CAAP Logo" className="logo" />
          <h1>Logging System</h1>
          <h2>MENU</h2>
        </div>
        <div className="sidebar-divider"></div>
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
          <div className="header-container">
            <h className="header-title">Air Navigation Service</h>

            <div className="datetime-container">
              <img src={clock} alt="clock-icon" className="clock-icon" />
              <span className="datetime-single">
                {dateTime.toLocaleTimeString("en-GB", {
                  timeZone: "UTC",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                {dateTime.toLocaleDateString("en-US", {
                  timeZone: "UTC",
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="quick-actions">
            <h className="quick-text">Quick Actions</h>
            <div className="actions-items">
              <button className="action">
                <p className="action-text1">Add Log Entry</p>
                <p className="action-text2">Record a new event or note</p>
                <div className="add-container">
                  <img src={add} alt="add-icon" className="add-icon" />
                </div>
              </button>
              <button className="action">
                <p className="action-text1">Export PDF</p>
                <p className="action-text2">Download log as PDF report</p>
                <div className="export-container">
                  <img src={exp} atl="export-icon" className="export-icon" />
                </div>
              </button>
              <button className="action">
                <p className="action-text1">View Today's Log</p>
                <p className="action-text2">See all entries for this shift</p>
                <div className="view-container">
                  <img src={view} atl="view-icon" className="view-icon" />
                </div>
              </button>
            </div>
          </div>
          <div className="entry-container">
            <h className="entry-text">Latest Entry</h>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
