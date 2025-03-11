import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
} from "@mui/material";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/recover-password`, { email });
      setMessage(
        <Alert severity="success">
          Password recovery email sent. Please check your inbox.
        </Alert>
      );
    } catch (err) {
      setMessage(
        <Alert severity="error">
          Failed to send password recovery email. Please try again.
        </Alert>
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Forgot Password
        </Typography>
        {message && <Box sx={{ my: 2 }}>{message}</Box>}
        <form onSubmit={handleForgotPassword}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Send Recovery Email
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          <Link to="/login">Back to Login</Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;