import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Container, Paper, Box, Alert } from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

console.log("Google Client ID (React):", GOOGLE_CLIENT_ID);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem("token", res.data.token);
      setMessage(<Alert severity="success">Login successful! Redirecting...</Alert>);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setMessage(<Alert severity="error">Invalid credentials. If you are not registered, please <Link to="/register">register here</Link>.</Alert>);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post(`${API_URL}/authorize/google`, { token: response.credential });
      localStorage.setItem("token", res.data.token);
      setMessage(<Alert severity="success">Google login successful! Redirecting...</Alert>);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage(<Alert severity="error">Google login failed. Please try again.</Alert>);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Login to Your Account
          </Typography>
          {message && <Box sx={{ my: 2 }}>{message}</Box>}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
          <Box sx={{ my: 2 }}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage(<Alert severity="error">Google login failed.</Alert>)} />
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account? <Link to="/register">Register here</Link>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link to="/">Back to Home</Link>
          </Typography>
        </Paper>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Login;
