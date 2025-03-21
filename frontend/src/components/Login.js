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
  CircularProgress
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.REACT_APP_API_URL;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false); // 🔄 Added redirect spinner state
  const navigate = useNavigate();

  // Normal password-based login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/login`, {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setMessage(<Alert severity="success">Login successful!</Alert>);
      
      setIsRedirecting(true); // 🔄 Show loading spinner

      setTimeout(() => navigate("/dashboard"), 2000); // ⏳ Redirect after 2 seconds
    } catch (err) {
      setIsRedirecting(false); // ❌ Stop spinner on error

      if (err.response?.status === 403) {
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
      const idToken = credentialResponse.credential;
      const res = await axios.post(`${API_URL}/login/google`, {
        token: idToken,
      });
      // console.log(res.data);
      localStorage.setItem("token", res.data.token);
      setMessage(<Alert severity="success">Google login successful!</Alert>);

      setIsRedirecting(true); // 🔄 Show loading spinner

      setTimeout(() => navigate("/dashboard"), 2000); // ⏳ Redirect after 2 seconds
    } catch (error) {
      setIsRedirecting(false); // ❌ Stop spinner on error

      setMessage(<Alert severity="error">Google login failed. Please try again.</Alert>);
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

          {/* Show loading spinner while redirecting */}
          {isRedirecting ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {/* Traditional username/password login */}
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="User ID"
                  type="text"
                  variant="outlined"
                  margin="normal"
                  value={username}
                  onChange={(e) => setUser(e.target.value)}
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

              <Typography variant="body2" sx={{ mt: 2 }}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </Typography>

              <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="body1" sx={{ mx: 2 }}>or</Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              {/* Google Login */}
              <Box sx={{ my: 2 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setMessage(<Alert severity="error">Google login failed.</Alert>)
                  }
                />
              </Box>

              <Typography variant="body2" sx={{ mt: 2 }}>
                Don't have an account? <Link to="/register">Register here</Link>.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                <Link to="/">Back to Home</Link>
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Login;
