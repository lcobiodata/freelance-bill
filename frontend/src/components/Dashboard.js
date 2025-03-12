import React from "react";
import { Typography, Container, Paper, Box } from "@mui/material";

const Dashboard = () => {
  // Retrieve token from localStorage to check authentication
  const token = localStorage.getItem("token");

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        {token ? (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">You are logged in.</Typography>
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