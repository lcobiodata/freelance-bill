import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material"; // Import icons
import { useNavigate } from "react-router-dom";
import InvoiceSummary from "./InvoiceSummary"; // Import InvoiceSummary component

const API_URL = process.env.REACT_APP_API_URL;

const CreateInvoice = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [invoice, setInvoice] = useState({
    client_id: "",
    issue_date: "",
    due_date: "",
    currency: "USD", // Default currency
    tax_rate: 0, // Default tax rate
    status: "Unpaid",
    payment_method: "",
    items: []
  });

  const [newItem, setNewItem] = useState({ type: "", description: "", quantity: "", rate: "", discount: 0, unit: "" }); // Default discount
  const [editIndex, setEditIndex] = useState(null); // Track editing index
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({}); // Track missing fields
  const [isConfirmed, setIsConfirmed] = useState(false); // ✅ Checkbox state

  const [isAddingClient, setIsAddingClient] = useState(false); // State to open/close Add Client dialog
  const [newClient, setNewClient] = useState({ name: "", business_name: "", email: "", phone: "", address: "", tax_number: "" }); // New client state
  const [isSavingClient, setIsSavingClient] = useState(false); // Loading state for saving client

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const response = await fetch(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setClients(data);
  };

  // Handle form input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedInvoice = { ...invoice, [name]: value };

    if (name === "client_id" && value === "new") {
      setIsAddingClient(true); // Open Add Client dialog
      return;
    }

    setInvoice(updatedInvoice);
    setErrors((prev) => ({ ...prev, [name]: "" })); // Clear error when typing
  
    // Validate Due Date: Must be later than Issue Date
    if (updatedInvoice.issue_date && updatedInvoice.due_date) {
      if (new Date(updatedInvoice.due_date) <= new Date(updatedInvoice.issue_date)) {
        setErrors((prev) => ({ ...prev, due_date: "Due date must be later than the issue date." }));
      } else {
        setErrors((prev) => ({ ...prev, due_date: "" }));
      }
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    const updatedItem = { ...newItem, [name]: value };
    setNewItem(updatedItem);
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };  

  // ✅ **Add or Edit Item**
  const saveItem = () => {
    const { type, description, quantity, rate, discount, unit } = newItem;
    const newErrors = {};

    if (!type) newErrors.type = "Type is required."; // Add validation for type
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!quantity.trim()) newErrors.quantity = "Quantity is required.";
    if (!rate.trim()) newErrors.rate = "Rate is required.";
    if (discount < 0 || discount > 100) newErrors.discount = "Discount must be between 0 and 100.";
    if (!unit.trim()) newErrors.unit = "Unit is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const grossAmount = parseFloat(quantity) * parseFloat(rate);
    const netAmount = grossAmount * (1 - parseFloat(discount) / 100);

    const updatedItems = [...invoice.items];

    if (editIndex !== null) {
      // ✅ **Editing an existing item**
      updatedItems[editIndex] = { ...newItem, grossAmount, netAmount, unit: unit.toUpperCase() };
      setEditIndex(null); // Reset edit mode
    } else {
      // ✅ **Adding a new item**
      updatedItems.push({ ...newItem, type, grossAmount, netAmount, unit: unit.toUpperCase() });
    }

    setInvoice({ ...invoice, items: updatedItems });

    setNewItem({ description: "", quantity: "", rate: "", discount: 0, unit: "" }); // Reset with default discount
    setIsConfirmed(false); // Uncheck the disclaimer checkbox
  };

  // ✅ **Edit Item**
  const editItem = (index) => {
    setNewItem(invoice.items[index]);
    setEditIndex(index);
    setIsConfirmed(false); // Uncheck the disclaimer checkbox
  };

  // ✅ **Delete Item**
  const deleteItem = (index) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    setInvoice({ ...invoice, items: updatedItems });
    setIsConfirmed(false); // Uncheck the disclaimer checkbox
  };

  // Validate before submission
  const validateForm = () => {
    const newErrors = {};
    if (!invoice.client_id) newErrors.client_id = "Client selection is required.";
    if (!invoice.issue_date) newErrors.issue_date = "Issue date is required.";
    if (!invoice.due_date) newErrors.due_date = "Due date is required.";
    if (invoice.due_date && invoice.issue_date && invoice.due_date < invoice.issue_date) {
      newErrors.due_date = "Due date must be later than the issue date.";
    }
    if (!invoice.payment_method) newErrors.payment_method = "Payment method is required.";
    if (invoice.items.length === 0) newErrors.items = "At least one item is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsRedirecting(true);
  
    // Prepare invoice data without calculations (server handles them)
    const invoiceData = {
      client_id: invoice.client_id,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      currency: invoice.currency,
      tax_rate: Number(invoice.tax_rate), // Ensure it's a number
      status: invoice.status,
      payment_method: invoice.payment_method,
      items: invoice.items.map((item) => ({
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        discount: item.discount,
      })),
    };
  
    try {
      console.log("Submitting invoice:", invoiceData); // Log before sending
  
      const response = await fetch(`${API_URL}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(invoiceData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating invoice:", errorData);
        throw new Error("Failed to create invoice.");
      }
  
      setMessage(<Alert severity="success">Invoice created successfully!</Alert>);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage(<Alert severity="error">Failed to create invoice. Please try again.</Alert>);
      setIsRedirecting(false);
    }
  };

  // Handle new client input changes
  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  // Save new client to the API
  const handleSaveNewClient = async () => {
    setIsSavingClient(true); // Show loading spinner

    try {
      const response = await fetch(`${API_URL}/client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding client:", errorData);
        throw new Error("Failed to add client.");
      }

      const addedClient = await response.json();
      setClients([...clients, addedClient]); // Add new client to the list
      setInvoice({ ...invoice, client_id: addedClient.id }); // Set the new client as selected

      // Wait for 2 seconds before closing the dialog and updating the client list
      setTimeout(() => {
        setIsAddingClient(false); // Close the dialog
        setNewClient({ name: "", business_name: "", email: "", phone: "", address: "", tax_number: "" }); // Reset new client form
        setIsSavingClient(false); // Hide loading spinner
        fetchClients(); // Refresh the client list
      }, 2000);
    } catch (error) {
      console.error("Error adding client:", error);
      setIsSavingClient(false); // Hide loading spinner on error
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
        <Typography variant="h5" gutterBottom>Create Invoice</Typography>

        {message && <Box sx={{ my: 2 }}>{message}</Box>}

        {isRedirecting ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <TextField
              select
              label="Select Client *"
              name="client_id"
              fullWidth
              margin="normal"
              value={invoice.client_id}
              onChange={handleChange}
              error={!!errors.client_id}
              helperText={errors.client_id}
            >
              <MenuItem value="new">
                <Add /> New client
              </MenuItem>
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField label="Issue Date *" type="date" name="issue_date" fullWidth margin="normal"
              onChange={handleChange} InputLabelProps={{ shrink: true }}
              error={!!errors.issue_date} helperText={errors.issue_date}
            />
            <TextField label="Due Date *" type="date" name="due_date" fullWidth margin="normal"
              onChange={handleChange} InputLabelProps={{ shrink: true }}
              error={!!errors.due_date} helperText={errors.due_date}
            />
            <TextField label="Currency *" select name="currency" fullWidth margin="normal"
              value={invoice.currency} onChange={handleChange}
              error={!!errors.currency} helperText={errors.currency}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              {/* Add more currencies as needed */}
            </TextField>
            <TextField label="Tax (%)" type="number" name="tax_rate" fullWidth margin="normal"
              value={invoice.tax_rate} onChange={handleChange} inputProps={{ min: 0, max: 100 }} error={!!errors.tax_rate} helperText={errors.tax_rate} />

            <TextField select label="Payment Method *" name="payment_method" fullWidth margin="normal"
              value={invoice.payment_method} onChange={handleChange}
              error={!!errors.payment_method} helperText={errors.payment_method}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            </TextField>

            <Typography variant="h6" sx={{ mt: 3 }}>Invoice Items</Typography>

            {errors.items && <Alert severity="error">{errors.items}</Alert>}

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Discount (%)</TableCell>
                    <TableCell>Gross</TableCell>
                    <TableCell>Net</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.rate}</TableCell>
                      <TableCell>{item.discount}</TableCell>
                      <TableCell>{item.grossAmount !== undefined ? Number(item.grossAmount).toFixed(2) : "N/A"}</TableCell>
                      <TableCell>{item.netAmount !== undefined ? Number(item.netAmount).toFixed(2) : "N/A"}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => editItem(index)} color="primary">
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => deleteItem(index)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TextField
              select
              label="Type *"
              name="type"
              fullWidth
              margin="normal"
              value={newItem.type}
              onChange={handleItemChange}
              error={!!errors.type}
              helperText={errors.type}
            >
              <MenuItem value="Product">Product</MenuItem>
              <MenuItem value="Service">Service</MenuItem>
            </TextField>
            <TextField label="Quantity *" type="number" name="quantity" fullWidth margin="normal" value={newItem.quantity} onChange={handleItemChange} error={!!errors.quantity} helperText={errors.quantity} />
            <TextField
              select
              label="Unit *"
              name="unit"
              fullWidth
              margin="normal"
              value={newItem.unit}
              onChange={handleItemChange}
              error={!!errors.unit}
              helperText={errors.unit}
            >
              <MenuItem value="ITEM">Item</MenuItem>
              <MenuItem value="HOUR">Hour</MenuItem>
            </TextField>
            <TextField label="Description *" name="description" fullWidth margin="normal" value={newItem.description} onChange={handleItemChange} error={!!errors.description} helperText={errors.description} />
            <TextField label="Rate *" type="number" name="rate" fullWidth margin="normal" value={newItem.rate} onChange={handleItemChange} error={!!errors.rate} helperText={errors.rate} />
            <TextField label="Discount (%)" type="number" name="discount" fullWidth margin="normal" value={newItem.discount} onChange={handleItemChange} inputProps={{ min: 0, max: 100 }} error={!!errors.discount} helperText={errors.discount} />

            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
              <Button variant="contained" color="primary" onClick={saveItem}>
                {editIndex !== null ? "Update Item" : "Add Item"}
              </Button>
            </Box>

            {/* ✅ Checkbox for confirmation */}
            <FormControlLabel
              control={<Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} />}
              label="I hereby confirm that all the information provided is correct and true."
              sx={{ mt: 3 }}
            />
            <InvoiceSummary invoice={invoice} isConfirmed={isConfirmed} handleSubmit={handleSubmit} />
          </>
        )}
      </Paper>

      {/* Add Client Dialog */}
      <Dialog open={isAddingClient} onClose={() => setIsAddingClient(false)}>
        <DialogTitle>Add Client</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth margin="normal"
            value={newClient.name} onChange={handleNewClientChange} required />
          <TextField label="Business Name" name="business_name" fullWidth margin="normal"
            value={newClient.business_name} onChange={handleNewClientChange} />
          <TextField label="Email" name="email" fullWidth margin="normal"
            value={newClient.email} onChange={handleNewClientChange} required />
          <TextField label="Phone" name="phone" fullWidth margin="normal"
            value={newClient.phone} onChange={handleNewClientChange} />
          <TextField label="Address" name="address" fullWidth margin="normal"
            value={newClient.address} onChange={handleNewClientChange} />
          <TextField label="Tax Number" name="tax_number" fullWidth margin="normal"
            value={newClient.tax_number} onChange={handleNewClientChange} /> {/* Add Tax Number field */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddingClient(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSaveNewClient} color="primary" variant="contained" disabled={isSavingClient}>
            {isSavingClient ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateInvoice;