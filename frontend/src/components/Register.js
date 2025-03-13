import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
} from "@mui/material";
import validator from "validator";

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Client-side email format check
    if (!validator.isEmail(email)) {
      setMessage(
        <Alert severity="error">
          Invalid email format.
        </Alert>
      );
      return;
    }

    setIsSubmitting(true); // disable the button while registering

    try {
      const res = await axios.post(`${API_URL}/register`, {
        username,
        password,
        name,
        business_name: businessName,
        email,
        phone,
        address,
        tax_number: taxNumber,
      });

      // Show a message that an email was sent and keep the button disabled
      setMessage(
        <Alert severity="success">
          {res.data.message ||
            "Registration successful! A verification email has been sent. Please check your inbox."}
        </Alert>
      );

    } catch (err) {
      if (err.response?.data?.message === "User already exists") {
        setMessage(
          <Alert severity="warning">
            User already exists. Please <Link to="/login">login here</Link>.
          </Alert>
        );
      } else {
        setMessage(
          <Alert severity="error">
            Registration failed. Please try again.
          </Alert>
        );
      }
      setIsSubmitting(false); // re-enable in case of error
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Create an Account
        </Typography>
        {message && (
          <Box sx={{ my: 2 }}>
            {message}
          </Box>
        )}
        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="User ID"
            type="text"
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
          <TextField
            fullWidth
            label="Name"
            type="text"
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Business Name"
            type="text"
            variant="outlined"
            margin="normal"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
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
          <TextField
            fullWidth
            label="Phone"
            type="text"
            variant="outlined"
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            fullWidth
            label="Address"
            type="text"
            variant="outlined"
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <TextField
            fullWidth
            label="Tax Number"
            type="text"
            variant="outlined"
            margin="normal"
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
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
