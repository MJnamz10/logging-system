import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';   // make sure the filename matches exactly
import './css/login.css';       // optional, you can import later in App/pages

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
