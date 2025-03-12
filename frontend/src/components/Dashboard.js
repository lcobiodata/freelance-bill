import React, { useEffect, useState } from "react";
import { Typography, Container, Paper, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Retrieve token from localStorage to check authentication
  const token = localStorage.getItem("token");
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    if (token) {
      fetchInvoices();
      fetchClients();
    }
  }, [token]);

  const fetchInvoices = async () => {
    const response = await fetch("/api/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setInvoices(data);
  };

  const fetchClients = async () => {
    const response = await fetch("/api/clients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setClients(data);
  };

  const markAsPaid = async (invoiceId) => {
    await fetch(`/api/invoice/${invoiceId}/mark-paid`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchInvoices();
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        {token ? (
          <>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">Invoices</Typography>
              <TableContainer component={Paper}>
                <Table>
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
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.invoice_number}>
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>${invoice.total_amount}</TableCell>
                        <TableCell>{invoice.status}</TableCell>
                        <TableCell>
                          {invoice.status !== "Paid" && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => markAsPaid(invoice.invoice_number)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                component={Link}
                to="/create-invoice"
              >
                Create Invoice
              </Button>
            </Box>

            <Box sx={{ mt: 5 }}>
              <Typography variant="h6">Clients</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                component={Link}
                to="/add-client"
              >
                Add Client
              </Button>
            </Box>
          </>
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