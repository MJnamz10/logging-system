import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Logs from "./pages/logs.jsx";

function App() {
  const [latestLogs, setLatestLogs] = useState([]); // for Dashboard
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
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;