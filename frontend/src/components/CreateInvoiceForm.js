import React, { useEffect, useState } from "react";
import { TextField, Button, Container, Paper, Typography, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";

const CreateInvoiceForm = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [clients, setClients] = useState([]);
  const [invoice, setInvoice] = useState({
    client_id: "",
    issue_date: "",
    due_date: "",
    subtotal: 0,
    tax_amount: 0,
    discount: 0,
    total_amount: 0,
    status: "Unpaid",
    payment_method: "",
    items: []
  });
  const [newItem, setNewItem] = useState({ description: "", quantity: 1, rate: 0, amount: 0 });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const response = await fetch("/clients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setClients(data);
  };

  const handleChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value });
  };

  const handleItemChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const addItem = () => {
    const itemAmount = parseFloat(newItem.quantity) * parseFloat(newItem.rate);
    const updatedItems = [...invoice.items, { ...newItem, amount: itemAmount }];
    const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = parseFloat(invoice.tax_amount);
    const discount = parseFloat(invoice.discount);
    const newTotal = newSubtotal + tax - discount;
    setInvoice({ ...invoice, items: updatedItems, subtotal: newSubtotal, total_amount: newTotal });
    setNewItem({ description: "", quantity: 1, rate: 0, amount: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(invoice),
    });
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" gutterBottom>
          Create Invoice
        </Typography>
        <TextField
          select
          label="Select Client"
          name="client_id"
          fullWidth
          margin="normal"
          value={invoice.client_id}
          onChange={handleChange}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField label="Issue Date" type="date" name="issue_date" fullWidth margin="normal" onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <TextField label="Due Date" type="date" name="due_date" fullWidth margin="normal" onChange={handleChange} InputLabelProps={{ shrink: true }} />
        <TextField label="Tax Amount" type="number" name="tax_amount" fullWidth margin="normal" onChange={handleChange} />
        <TextField label="Discount" type="number" name="discount" fullWidth margin="normal" onChange={handleChange} />
        <TextField select label="Payment Method" name="payment_method" fullWidth margin="normal" value={invoice.payment_method} onChange={handleChange}>
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="PayPal">PayPal</MenuItem>
          <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
        </TextField>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Invoice Items
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.rate}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TextField label="Description" name="description" fullWidth margin="normal" onChange={handleItemChange} />
        <TextField label="Quantity" type="number" name="quantity" fullWidth margin="normal" onChange={handleItemChange} />
        <TextField label="Rate" type="number" name="rate" fullWidth margin="normal" onChange={handleItemChange} />
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={addItem}>
          Add Item
        </Button>
        <Button variant="contained" color="secondary" sx={{ mt: 3, ml: 2 }} onClick={handleSubmit}>
          Submit Invoice
        </Button>
      </Paper>
    </Container>
  );
};

export default CreateInvoiceForm;