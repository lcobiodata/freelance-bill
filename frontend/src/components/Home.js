import React from "react";
import { Box, Typography } from "@mui/material";

const Home = () => (
  <Box textAlign="center" mt={5}>
    <Typography variant="h3" gutterBottom>
      Welcome to <strong>FreelanceBill</strong>
    </Typography>
    <Typography variant="subtitle1">
      Manage your freelance invoices with ease.
    </Typography>
  </Box>
);

export default Home;
