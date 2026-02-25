import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Logs from "./pages/logs.jsx";
import Summary from "./pages/summary.jsx";

/* ============================================================
   APP COMPONENT - Main Application Entry Point
   Handles routing and global state management for logs
============================================================ */
function App() {
  /* ----------------------------------------------------------
     STATE: Log entries with localStorage persistence
     - Initializes from cache for faster load
     - Gets updated from backend on mount
  ---------------------------------------------------------- */
  const [latestLogs, setLatestLogs] = useState(() => {
    const saved = localStorage.getItem("cached_logs");
    return saved ? JSON.parse(saved) : [];
  });

  /* ----------------------------------------------------------
     FETCH: Get all logs from backend
     - Updates state with fresh data from server
     - Updates localStorage cache for persistence
  ---------------------------------------------------------- */
  const fetchAllLogs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5001/logs");
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      console.log("Fetched logs from backend:", data); // Debug log
      
      // Update state and localStorage cache
      setLatestLogs(data);
      localStorage.setItem("cached_logs", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
  }, []);

  /* ----------------------------------------------------------
     EFFECT: Fetch logs on app mount
     - Clears old cache to ensure fresh data with images
  ---------------------------------------------------------- */
  useEffect(() => {
    // Clear old cache to fetch fresh data (ensures images column is included)
    localStorage.removeItem("cached_logs");
    fetchAllLogs();
  }, [fetchAllLogs]);

  /* ============================================================
     RENDER: Application Routes
  ============================================================ */
  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<Login />} />
        
        {/* Dashboard - Main view with log management */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              latestLogs={latestLogs}
              setLatestLogs={setLatestLogs}
            />
          }
        />
        
        {/* Logs Page - Read-only view */}
        <Route path="/logs" element={<Logs latestLogs={latestLogs} />} />
         <Route
          path="/summary"
          element={
            <Summary
              latestLogs={latestLogs}
              setLatestLogs={setLatestLogs}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;