import React, { useState } from "react";
import { TextField, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AddClientForm = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [client, setClient] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    address: ""
  });

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_URL}/client`, { // Use API_URL constant
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(client)
    });
    
    if (response.ok) {
      navigate("/dashboard");
      window.location.reload(); // Force refresh to fetch updated clients
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Add New Client
        </Typography>
        <TextField label="Name" name="name" fullWidth margin="normal" onChange={handleChange} />
        <TextField label="Business Name" name="business_name" fullWidth margin="normal" onChange={handleChange} />
        <TextField label="Email" name="email" type="email" fullWidth margin="normal" onChange={handleChange} />
        <TextField label="Phone" name="phone" fullWidth margin="normal" onChange={handleChange} />
        <TextField label="Address" name="address" fullWidth margin="normal" onChange={handleChange} />
        <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={handleSubmit}>
          Add Client
        </Button>
      </Paper>
    </Container>
  );
};

export default AddClientForm;
