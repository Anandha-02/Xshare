import React from "react";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div
      style={{
        background: "url('/background.jpg') no-repeat center center/cover",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <div style={{ textAlign: "center", paddingTop: "150px", color: "#fff" }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>Welcome to XShare</h1>
        <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
          Fast, Secure, and Easy File Sharing
        </p>
        <button
          style={{
            marginTop: "30px",
            padding: "10px 25px",
            fontSize: "1rem",
            cursor: "pointer",
            backgroundColor: "#1D4ED8",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
          }}
          onClick={() => window.location.href = "/upload"}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;