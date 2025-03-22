import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Import the Exit icon
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import EmailVerificationSuccess from "./components/EmailVerificationSuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CreateInvoice from "./components/CreateInvoice";
import AddClient from "./components/AddClient";

const clearTokenOnLoad = () => {
  localStorage.removeItem("token");
};

const Navbar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary" sx={{ boxShadow: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          FreelanceBill
        </Typography>
        {token ? (
          <>
            {location.pathname !== "/dashboard" && (
              <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}></Button>
            )}
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
          </>
        ) : (
          <>
            {location.pathname !== "/login" && (
              <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}></Button>
            )}
            {location.pathname !== "/register" && (
              <Button color="inherit" component={Link} to="/register" startIcon={<PersonAddIcon />}></Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  useEffect(() => {
    clearTokenOnLoad();
  }, []);

  return (
    <Router>
      <Navbar />
      <Container maxWidth={false} sx={{ py: 4, display: "inline-block" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-success" element={<EmailVerificationSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/add-client" element={<AddClient />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
};

const Footer = () => (
  <Box
    component="footer"
    sx={{
      textAlign: "center",
      py: 2,
      mt: 4,
      bgcolor: "primary.main",
      color: "white",
    }}
  >
    <Typography variant="body2">
      © {new Date().getFullYear()} FreelanceBill. All rights reserved.
    </Typography>
  </Box>
);

export default App;