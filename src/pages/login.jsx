import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/CAAP_Logo.png";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // login successful
        navigate("/dashboard"); // navigate automatically
      } else {
        alert(data.message); // invalid credentials
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // Detect Enter key and prevent default
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent page reload
      handleLogin();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} alt="CAAP Logo" className="logo" />
        <div className="h1">CIVIL AVIATION AUTHORITY OF THE PHILIPPINES</div>
        <h3>Air Navigation Service</h3>
        <p>Logging System</p>
        <p1>Sign in to access the dashboard</p1>

        <p className="text1">Username</p>
        <input
          className="email"
          type="email"
          placeholder="Enter your Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown} // ← Enter triggers login
        />

        <p className="text2">Password</p>
        <input
          className="password"
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown} // ← Enter triggers login
        />

        <button onClick={handleLogin}>Sign In</button>
      </div>
    </div>
  );
}

export default Login;
