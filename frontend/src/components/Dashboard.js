import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box, Grid, Tabs, Tab, Card, CardContent } from "@mui/material";
import { ClientsTable } from "./ClientsTable";
import { InvoicesTable } from "./InvoicesTable";
import { ProfileCard } from "./ProfileCard"; // Import the new Profile component
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
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to mark invoice as paid");
  
      // Update the invoice status locally
      setInvoices(prevInvoices => prevInvoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: "Paid" } : invoice
      ));
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  const markAsCancelled = async (invoiceId) => {
    console.log("Cancelling invoice:", invoiceId);
    try {
      const response = await fetch(`${API_URL}/invoice/${invoiceId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error cancelling invoice:", errorData);
        throw new Error("Failed to cancel invoice.");
      }
  
      // Update the invoice status locally
      setInvoices(prevInvoices => prevInvoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: "Cancelled" } : invoice
      ));
    } catch (error) {
      console.error("Error cancelling invoice:", error);
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
      const clientInvoices = invoices.filter(invoice => {
        return invoice.client_id === client.id; // Ensure the property name matches
      });
      // console.log("Client invoices:", clientInvoices); // Debugging: Log the client invoices
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
    <Grid container spacing={3} sx={{ height: '100%' }}>
      <Grid item xs={12} sm={3}>
        <ProfileCard user={user} loading={loadingUser} updateUser={updateUserDetails} /> 
      </Grid>
      <Grid item xs={12} sm={9}>
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
                label="Clients" 
                sx={{ 
                  fontWeight: tabIndex === 0 ? 'bold' : 'normal', 
                  color: tabIndex === 0 ? 'primary.main' : 'text.secondary' 
                }} 
              />
              <Tab 
                label="Invoices" 
                sx={{ 
                  fontWeight: tabIndex === 1 ? 'bold' : 'normal', 
                  color: tabIndex === 1 ? 'primary.main' : 'text.secondary' 
                }} 
              />
            </Tabs>
            {tabIndex === 0 && <ClientsTable clients={clients} loading={loadingClients} fetchClients={fetchClients} />}
            {tabIndex === 1 && <InvoicesTable invoices={invoices} loading={loadingInvoices} markAsPaid={markAsPaid} markAsCancelled={markAsCancelled} />}
          </Paper>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Dashboard;