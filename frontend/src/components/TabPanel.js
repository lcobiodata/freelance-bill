import React from "react";
import { Box } from "@mui/material";

export const TabPanel = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`vertical-tabpanel-${index}`}
    aria-labelledby={`vertical-tab-${index}`}
    style={{ flexGrow: 1, overflow: "auto", width: "100%" }}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);
