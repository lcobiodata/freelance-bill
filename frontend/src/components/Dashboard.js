import React, { useEffect, useState } from "react";
import { Typography, Container, Paper } from "@mui/material";
import { ClientsTable } from "./ClientsTable";
import { InvoicesTable } from "./InvoicesTable";
import { ProfileForm } from "./ProfileForm"; // Import the new Profile component
import { DashboardTabs } from "./DashboardTabs";

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

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        {token ? (
          <DashboardTabs tabIndex={tabIndex} setTabIndex={setTabIndex}>
            <ProfileForm user={user} loading={loadingUser} updateUser={updateUserDetails} />
            <ClientsTable clients={clients} loading={loadingClients} fetchClients={fetchClients} />
            <InvoicesTable invoices={invoices} loading={loadingInvoices} />
          </DashboardTabs>
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
