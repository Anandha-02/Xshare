import React, { useState } from "react";
import Navbar from "../components/Navbar";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("All fields are required!");
    alert(`Registered ${name} successfully!`);
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "0 auto" }}>
      <Navbar />
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "10px", borderRadius: "5px", border: "1px solid gray" }}
        />
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
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;