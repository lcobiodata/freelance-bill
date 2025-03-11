import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState("");       // Renamed to "email" for clarity
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Normal password-based login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/login`, {
        username: email, // If your server expects "username", pass email as the value
        password,
      });
      localStorage.setItem("token", res.data.token);
      setMessage(
        <Alert severity="success">Login successful! Redirecting...</Alert>
      );
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      // Example: If your Flask code returns 403 for unverified email
      if (err.response?.status === 403) {
        // Or check err.response.data.message === 'Email not verified...'
        setMessage(
          <Alert severity="warning">
            Your email is not verified. Please check your inbox.
          </Alert>
        );
      } else {
        setMessage(
          <Alert severity="error">
            Invalid credentials. If you are not registered, please{" "}
            <Link to="/register">register here</Link>.
          </Alert>
        );
      }
    }
  };

  // Google OAuth success callback
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // 1. The user just logged in with Google: get ID token from Google
      const idToken = credentialResponse.credential;

      // 2. POST the ID token to your /login/google endpoint
      const res = await axios.post(`${API_URL}/login/google`, {
        token: idToken,
      });

      // 3. Store your own JWT
      localStorage.setItem("token", res.data.token);

      setMessage(
        <Alert severity="success">Google login successful! Redirecting...</Alert>
      );
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage(
        <Alert severity="error">Google login failed. Please try again.</Alert>
      );
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

          {/* Traditional email/password login */}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"           // Helps with basic HTML5 validation
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>

          {/* Divider with "or" text */}
          <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body1" sx={{ mx: 2 }}>or</Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          {/* Google Login Button */}
          <Box sx={{ my: 2 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setMessage(
                  <Alert severity="error">Google login failed.</Alert>
                )
              }
            />
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