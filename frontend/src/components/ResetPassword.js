import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Container, Paper, Box, Alert } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL;

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage(<Alert severity="error">Passwords do not match.</Alert>);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/reset-password/${token}`, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(<Alert severity="success">Password reset successful!</Alert>);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(<Alert severity="error">{err.response.data.message}</Alert>);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Reset Password
        </Typography>
        {message && <Box sx={{ my: 2 }}>{message}</Box>}
        <form onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Reset Password
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ResetPassword;