import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box, Grid, Tabs, Tab, Card, CardContent } from "@mui/material";
import { ClientsTable } from "./ClientsTable";
import { InvoicesTable } from "./InvoicesTable";
import { ProfileForm } from "./ProfileForm"; // Import the new Profile component
import TopClientLoyaltyCard from "./TopClientLoyaltyCard";
import TopClientRevenueCard from "./TopClientRevenueCard";

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
    console.log("Marking invoice as paid:", invoiceId);
    try {
      const response = await fetch(`${API_URL}/invoice/${invoiceId}/mark-paid`, { // API expects invoice ID
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to mark invoice as paid");
  
      fetchInvoices(); // Refresh invoices after marking as paid
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
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

  const findTopClients = () => {
    const clientStats = clients.map(client => {
      const clientInvoices = invoices.filter(invoice => invoice.clientId === client.id);
      return {
        ...client,
        invoiceCount: clientInvoices.length,
        totalRevenue: clientInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount || 0), 0),
      };
    });

    const topLoyaltyClient = clientStats.sort((a, b) => b.invoiceCount - a.invoiceCount)[0] || null;
    const topRevenueClient = clientStats.sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null;

    return { topLoyaltyClient, topRevenueClient };
  };

  const { topLoyaltyClient, topRevenueClient } = findTopClients();

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
        {/* ✅ Place "Top Client" cards within the same Grid layout */}
        <Grid item xs={12} sm={4}>
          <TopClientLoyaltyCard client={topLoyaltyClient} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TopClientRevenueCard client={topRevenueClient} />
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
          <Tab 
            label="Profile" 
            sx={{ 
              fontWeight: tabIndex === 0 ? 'bold' : 'normal', 
              color: tabIndex === 0 ? 'primary.main' : 'text.secondary' 
            }} 
          />
          <Tab 
            label="Clients" 
            sx={{ 
              fontWeight: tabIndex === 1 ? 'bold' : 'normal', 
              color: tabIndex === 1 ? 'primary.main' : 'text.secondary' 
            }} 
          />
          <Tab 
            label="Invoices" 
            sx={{ 
              fontWeight: tabIndex === 2 ? 'bold' : 'normal', 
              color: tabIndex === 2 ? 'primary.main' : 'text.secondary' 
            }} 
          />
        </Tabs>
        {tabIndex === 0 && <ProfileForm user={user} loading={loadingUser} updateUser={updateUserDetails} />}
        {tabIndex === 1 && <ClientsTable clients={clients} loading={loadingClients} fetchClients={fetchClients} />}
        {tabIndex === 2 && <InvoicesTable invoices={invoices} loading={loadingInvoices} markAsPaid={markAsPaid} />}
      </Paper>
    </Container>
  );
};

export default Dashboard;