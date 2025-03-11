import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box } from "@mui/material";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home"; // Extracted Home as a separate component

const App = () => {
  return (
    <Router>
      {/* Navbar */}
      <AppBar position="static" color="primary" sx={{ boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            FreelanceBill
          </Typography>
          <Button color="inherit" component={Link} to="/login">
            Login
          </Button>
          <Button color="inherit" component={Link} to="/register">
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Container>

      {/* Footer */}
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
    </Router>
  );
};

export default App;
