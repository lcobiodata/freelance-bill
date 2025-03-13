import React, { useState } from "react";
import { TextField, Button, Container, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const AddClient = () => {
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
  
    const token = localStorage.getItem("token");  // Retrieve token from local storage
    if (!token) {
      console.error("No token found, user must be logged in");
      return;
    }
  
    try {
      const res = await fetch("http://127.0.0.1:5000/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include the JWT token
        },
        body: JSON.stringify(client), // Correctly passing the state

      });
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      console.log("Client added:", data);
    } catch (error) {
      console.error("Failed to add client:", error);
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

export default AddClient;
