import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import EmailVerificationSuccess from "./components/EmailVerificationSuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import CreateInvoiceForm from "./components/CreateInvoiceForm";
import AddClientForm from "./components/AddClientForm";

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
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-success" element={<EmailVerificationSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/create-invoice" element={<CreateInvoiceForm />} />
          <Route path="/add-client" element={<AddClientForm />} />
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
