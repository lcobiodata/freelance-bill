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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import validator from "validator";

const API_URL = process.env.REACT_APP_API_URL;

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [postCode, setPostCode] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [isBusiness, setIsBusiness] = useState(false); // Toggle for person or business
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isStrongPassword = (password) => {
    return validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (!isStrongPassword(newPassword)) {
      setPasswordError(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);

    if (newConfirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validator.isEmail(email)) {
      setMessage(<Alert severity="error">Invalid email format.</Alert>);
      return;
    }

    if (!isStrongPassword(password)) {
      setMessage(<Alert severity="error">Invalid password.</Alert>);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(<Alert severity="error">Passwords do not match.</Alert>);
      return;
    }

    if (isBusiness && !taxNumber) {
      setMessage(<Alert severity="error">Tax Number is required for businesses.</Alert>);
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine address fields into a single string
      const fullAddress = `${address}, ${city}, ${province}, ${country}, ${postCode}`;

      const res = await axios.post(`${API_URL}/register`, {
        username,
        password,
        name,
        business_name: isBusiness ? businessName : null,
        email,
        phone,
        address: fullAddress,
        tax_number: isBusiness ? taxNumber : null,
      });

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
          <Alert severity="error">Registration failed. Please try again.</Alert>
        );
      }
      setIsSubmitting(false);
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
            onChange={handlePasswordChange}
            error={!!passwordError}
            helperText={passwordError}
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={!!confirmPasswordError}
            helperText={confirmPasswordError}
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
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <RadioGroup
            row
            value={isBusiness ? "business" : "person"}
            onChange={(e) => setIsBusiness(e.target.value === "business")}
            sx={{ my: 2 }}
          >
            <FormControlLabel value="person" control={<Radio />} label="Person" />
            <FormControlLabel value="business" control={<Radio />} label="Business" />
          </RadioGroup>
          {isBusiness && (
            <>
              <TextField
                fullWidth
                label="Business Name"
                type="text"
                variant="outlined"
                margin="normal"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required={isBusiness}
              />
              <TextField
                fullWidth
                label="Tax Number"
                type="text"
                variant="outlined"
                margin="normal"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                required={isBusiness}
              />
            </>
          )}
          <TextField
            fullWidth
            label="Address"
            type="text"
            variant="outlined"
            margin="normal"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="City"
            type="text"
            variant="outlined"
            margin="normal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Province/State/County"
            type="text"
            variant="outlined"
            margin="normal"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            // required
          />
          <TextField
            fullWidth
            label="Country"
            type="text"
            variant="outlined"
            margin="normal"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Post Code"
            type="text"
            variant="outlined"
            margin="normal"
            value={postCode}
            onChange={(e) => setPostCode(e.target.value)}
            // required
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormLabel sx={{ mb: 1 }}>Phone</FormLabel>
            <PhoneInput
              country={"us"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputStyle={{
                width: "100%",
                height: "56px", // Match Material-UI TextField height
                borderRadius: "4px",
                border: "1px solid rgba(0, 0, 0, 0.23)", // Match Material-UI TextField border
                paddingLeft: "48px", // Adjust for country code dropdown
              }}
              placeholder="Enter your phone number"
              required
            />
          </FormControl>
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