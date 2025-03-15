import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { TabPanel } from "./TabPanel";

export const DashboardTabs = ({ tabIndex, setTabIndex, children }) => {
  return (
    <Box sx={{ display: "flex", minHeight: 500, overflow: "hidden" }}>
      <Tabs
        orientation="vertical"
        value={tabIndex}
        onChange={(e, v) => setTabIndex(v)}
        sx={{ borderRight: 1, borderColor: "divider", minWidth: 180 }}
      >
        <Tab label="Profile" />
        <Tab label="Invoices" />
        <Tab label="Clients" />
      </Tabs>

      {children.map((child, index) => (
        <TabPanel key={index} value={tabIndex} index={index}>
          {child}
        </TabPanel>
      ))}
    </Box>
  );
};
