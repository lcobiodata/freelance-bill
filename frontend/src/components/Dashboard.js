import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const TabPanel = ({ children, value, index }) => (
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

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (token) {
      fetchClients();
      fetchInvoices();
    }
  }, [token]);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(response.statusText);
      setInvoices(await response.json());
    } catch {
      setInvoices([]);
    }
    setLoadingInvoices(false);
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(response.statusText);
      setClients(await response.json());
    } catch {
      setClients([]);
    }
    setLoadingClients(false);
  };

  const markAsPaid = async (invoiceId) => {
    await fetch(`${API_URL}/invoice/${invoiceId}/mark-paid`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchInvoices();
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {token ? (
          <Box sx={{ display: "flex", minHeight: 500, overflow: "hidden" }}>
            <Tabs
              orientation="vertical"
              value={tabIndex}
              onChange={(e, v) => setTabIndex(v)}
              sx={{ borderRight: 1, borderColor: "divider", minWidth: 180 }}
            >
              <Tab label="Clients" />
              <Tab label="Invoices" />
            </Tabs>

            <TabPanel value={tabIndex} index={0}>
              <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Business Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Address</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingClients ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>{client.business_name || "N/A"}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phone || "N/A"}</TableCell>
                          <TableCell>{client.address || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="contained" color="secondary" sx={{ mt: 2 }} component={Link} to="/add-client">
                Add Client
              </Button>
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
              <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
                <Table stickyHeader sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingInvoices ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.invoice_number}>
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.client || "Unknown"}</TableCell>
                          <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                          <TableCell>{invoice.status}</TableCell>
                          <TableCell>
                            {invoice.status !== "Paid" && (
                              <Button variant="contained" onClick={() => markAsPaid(invoice.invoice_number)}>
                                Mark as Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
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
