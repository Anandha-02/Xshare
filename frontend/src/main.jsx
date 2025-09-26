import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global CSS imports
import "./styles/home.css";   // Homepage styles
import "./styles/login.css";  // Login styles
import "./styles/register.css";
import "./styles/upload.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
