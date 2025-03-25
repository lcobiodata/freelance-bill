import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const ClientForm = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [client, setClient] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    address: "",
    tax_number: "" // Add tax_number to state
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // 🔄 Added redirect spinner state
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      console.error("No token found, user must be logged in");
      setMessage(<Alert severity="error">Unauthorized: Please log in first.</Alert>);
      return;
    }

    setIsSubmitting(true); // 🔄 Show initial loading spinner

    try {
      const res = await fetch(`${API_URL}/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(client),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Client added:", data);

      setMessage(<Alert severity="success">Client added successfully!</Alert>);
      setIsSubmitting(false);
      setIsRedirecting(true); // 🔄 Show loading spinner for redirect

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (error) {
      console.error("Failed to add client:", error);
      setMessage(<Alert severity="error">Failed to add client. Please try again.</Alert>);
      setIsSubmitting(false); // ❌ Stop loader if request fails
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", alignItems: "flex-start", mt: 4 }}>
        <IconButton
          onClick={() => navigate("/dashboard")}
          sx={{ mr: 2, mt: 1 }}
          aria-label="Back to Dashboard"
        >
          <ArrowBack fontSize="large" />
        </IconButton>
      </Box>
      {/* <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}> */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Client
        </Typography>

        {message && <Box sx={{ my: 2 }}>{message}</Box>}

        {/* Show loading spinner while redirecting */}
        {isRedirecting ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} required />
            <TextField label="Business Name" name="business_name" fullWidth margin="normal" onChange={handleChange} />
            <TextField label="Email" name="email" type="email" fullWidth margin="normal" onChange={handleChange} required />
            <TextField label="Phone" name="phone" fullWidth margin="normal" onChange={handleChange} />
            <TextField label="Address" name="address" fullWidth margin="normal" onChange={handleChange} />
            <TextField label="Tax Number" name="tax_number" fullWidth margin="normal" onChange={handleChange} /> {/* Add Tax Number field */}
            
            <Button 
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={isSubmitting} // 🔄 Disable while submitting
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Add Client"} {/* 🔄 Show spinner while submitting */}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default ClientForm;