import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, { username, password });
      localStorage.setItem("token", res.data.token);
      setMessage("Login successful!");
    } catch (err) {
      setMessage("Invalid credentials. If you are not registered, please register first.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <br />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      {message.includes("Invalid credentials") && (
        <p>
          <Link to="/register">Register here</Link>
        </p>
      )}
    </div>
  );
};

export default Login;