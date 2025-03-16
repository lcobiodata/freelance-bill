import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box, Grid, Card, CardContent, Tabs, Tab } from "@mui/material";
import { ClientsTable } from "./ClientsTable";
import { InvoicesTable } from "./InvoicesTable";
import { ProfileForm } from "./ProfileForm"; // Import the new Profile component

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const token = localStorage.getItem("token");
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (token) {
      fetchClients();
      fetchInvoices();
      fetchUserDetails();
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

  const fetchUserDetails = async () => {
    setLoadingUser(true);
    try {
      const response = await fetch(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(response.statusText);
      setUser(await response.json());
    } catch {
      setUser(null);
    }
    setLoadingUser(false);
  };

  const updateUserDetails = async (updatedData) => {
    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update user details");
      fetchUserDetails(); // Refresh user details after update
    } catch (error) {
      console.error(error);
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to mark invoice as paid");
      fetchInvoices(); // Refresh invoices after marking as paid
    } catch (error) {
      console.error(error);
    }
  };

  const calculateTotalRevenue = () => {
    return invoices.reduce((total, invoice) => {
      const amount = parseFloat(invoice.total_amount) || 0; // Ensure amount is a number
      return total + amount;
    }, 0);
  };

  const countPendingInvoices = () => {
    return invoices.filter(invoice => !invoice.paid).length;
  };

  const findTopClient = () => {
    const clientInvoices = clients.map(client => ({
      ...client,
      invoiceCount: invoices.filter(invoice => invoice.clientId === client.id).length,
    }));
    return clientInvoices.sort((a, b) => b.invoiceCount - a.invoiceCount)[0];
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user ? user.name : "User"}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Here is your dashboard overview. Manage your clients, invoices, and profile information.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Invoices
              </Typography>
              <Typography variant="h4">
                {invoices.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Clients
              </Typography>
              <Typography variant="h4">
                {clients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4">
                ${calculateTotalRevenue().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Pending Invoices
              </Typography>
              <Typography variant="h4">
                {countPendingInvoices()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Top Client
              </Typography>
              <Typography variant="h4">
                {findTopClient() ? findTopClient().name : "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Profile" />
          <Tab label="Clients" />
          <Tab label="Invoices" />
        </Tabs>
        {tabIndex === 0 && <ProfileForm user={user} loading={loadingUser} updateUser={updateUserDetails} />}
        {tabIndex === 1 && <ClientsTable clients={clients} loading={loadingClients} fetchClients={fetchClients} />}
        {tabIndex === 2 && <InvoicesTable invoices={invoices} loading={loadingInvoices} markAsPaid={markAsPaid} />}
      </Paper>
    </Container>
  );
};

export default Dashboard;