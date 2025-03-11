import React from "react";
import { Link } from "react-router-dom";
import { Container, Paper, Typography, Box, Button } from "@mui/material";

const EmailVerificationSuccess = () => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Email Verified Successfully!
        </Typography>
        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            Your email has been verified. You can now log in.
          </Typography>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" component={Link} to="/login">
            Go to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationSuccess;