import React from "react";
import { Box, Typography } from "@mui/material";

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

export default Footer;