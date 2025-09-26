import React, { useState } from "react";
import Navbar from "../components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill all fields!");
    alert(`Logged in as ${email}`);
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <Navbar />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid gray" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid gray" }}
        />
        <button type="submit" style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#1D4ED8", color: "#fff", cursor: "pointer" }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;