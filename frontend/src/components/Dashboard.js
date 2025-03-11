import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Paper, Box } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();

  // Retrieve token from localStorage to check authentication
  const token = localStorage.getItem("token");

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        {token ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">You are logged in.</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Typography variant="body1" color="error">
            You are not logged in. Please <a href="/login">Login</a>.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
