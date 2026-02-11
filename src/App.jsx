import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Logs from "./pages/logs.jsx";

function App() {
  // 1. Initialize state from LocalStorage so it's NOT empty on refresh
  const [latestLogs, setLatestLogs] = useState(() => {
    const saved = localStorage.getItem("cached_logs");
    return saved ? JSON.parse(saved) : [];
  });

  const fetchAllLogs = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/logs");
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      // 2. Update state and update LocalStorage cache
      setLatestLogs(data);
      localStorage.setItem("cached_logs", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
  }, []);

  useEffect(() => {
    fetchAllLogs();
  }, [fetchAllLogs]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              latestLogs={latestLogs}
              setLatestLogs={setLatestLogs}
            />
          }
        />
        {/* Pass props to Logs as well if needed */}
        <Route path="/logs" element={<Logs latestLogs={latestLogs} />} />
      </Routes>
    </Router>
  );
}

export default App;