import React from "react";
import logo from "../assets/CAAP_logo.png";
import "../css/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <img src={logo} alt="CAAP Logo" className="logo" />
      <h1>CIVIL AVIATION AUTHORITY OF THE PHILIPPINES</h1>
      <h3>Air Navigation Service</h3>
      <p>Dashboard</p>
      <p>Welcome! You are logged in.</p>
    </div>
  );
}

export default Dashboard;
