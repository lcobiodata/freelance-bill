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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
    city: "",
    country: "",
    postCode: "",
    tax_number: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phone) => {
    setClient({ ...client, phone });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      console.error("No token found, user must be logged in");
      setMessage(<Alert severity="error">Unauthorized: Please log in first.</Alert>);
      return;
    }

    // Validate required fields
    if (!client.address || !client.city || !client.country) {
      setMessage(<Alert severity="error">Address, City, and Country are required fields.</Alert>);
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine address fields into a single string
      const fullAddress = [client.address, client.city, client.country, client.postCode]
        .filter((field) => field && field.trim() !== "")
        .join(", ");

      const res = await fetch(`${API_URL}/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...client, address: fullAddress }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Client added:", data);

      setMessage(<Alert severity="success">Client added successfully!</Alert>);
      setIsSubmitting(false);
      setIsRedirecting(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Failed to add client:", error);
      setMessage(<Alert severity="error">Failed to add client. Please try again.</Alert>);
      setIsSubmitting(false);
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
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Add New Client
        </Typography>

        {message && <Box sx={{ my: 2 }}>{message}</Box>}

        {isRedirecting ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              label="Business Name"
              name="business_name"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Phone
              </Typography>
              <PhoneInput
                country={"us"}
                value={client.phone}
                onChange={handlePhoneChange}
                inputStyle={{
                  width: "100%",
                  height: "56px", // Match Material-UI TextField height
                  borderRadius: "4px",
                  border: "1px solid rgba(0, 0, 0, 0.23)", // Match Material-UI TextField border
                  paddingLeft: "48px", // Adjust for country code dropdown
                }}
                placeholder="Enter phone number"
              />
            </Box>
            <TextField
              label="Address"
              name="address"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              label="City"
              name="city"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              label="Country"
              name="country"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              label="Post Code"
              name="postCode"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
            <TextField
              label="Tax Number"
              name="tax_number"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Add Client"}
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default ClientForm;