import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, Typography, Container, Paper, Box, Alert } from "@mui/material";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/register`, { username, password });
      setMessage(
        <Alert severity="success">
          Registration successful! Please <Link to="/login">login here</Link>.
        </Alert>
      );
    } catch (err) {
      if (err.response?.data?.message === "User already exists") {
        setMessage(
          <Alert severity="warning">
            User already exists. Redirecting to login...
          </Alert>
        );
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(<Alert severity="error">Registration failed. Please try again.</Alert>);
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Create an Account
        </Typography>
        {message && <Box sx={{ my: 2 }}>{message}</Box>}
        <form onSubmit={handleRegister}>
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
            Register
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login">Login here</Link>.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link to="/">Back to Home</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;
