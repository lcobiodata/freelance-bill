import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import InvoiceSummary from "./InvoiceSummary"; // Import InvoiceSummary component

// ✅ Import the modularized components
import ClientSelection from "./ClientSelection";
import InvoiceItemForm from "./InvoiceItemForm";
import InvoiceItemsTable from "./InvoiceItemsTable";
import NewClientDialog from "./NewClientDialog";

const API_URL = process.env.REACT_APP_API_URL;

const CreateInvoice = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [invoice, setInvoice] = useState({
    client_id: "",
    issue_date: "",
    due_date: "",
    currency: "USD",
    tax_rate: 0,
    status: "Unpaid",
    payment_method: "",
    payment_details: "", // Add payment_details field
    items: [],
  });

  const [newItem, setNewItem] = useState({ type: "", description: "", quantity: "", rate: "", discount: 0, unit: "" });
  const [editIndex, setEditIndex] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", business_name: "", email: "", phone: "", address: "", tax_number: "" });
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false); // Loading state for waiting after saving client

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  const saveItem = () => {
    if (!newItem.type || !newItem.description || !newItem.quantity || !newItem.rate) {
      setErrors((prev) => ({ 
        ...prev, 
        type: "Type is required.", 
        description: "Description is required."
      }));
      return;
    }
  
    const grossAmount = parseFloat(newItem.quantity) * parseFloat(newItem.rate);
    const netAmount = grossAmount * (1 - parseFloat(newItem.discount) / 100);
    const updatedItems = [...invoice.items];
  
    if (editIndex !== null) {
      updatedItems[editIndex] = { ...newItem, grossAmount, netAmount };
      setEditIndex(null);
    } else {
      updatedItems.push({ ...newItem, grossAmount, netAmount });
    }
  
    setInvoice((prev) => ({ ...prev, items: updatedItems }));
  
    // ✅ Clear the "items" error and the global message if an item is added
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.items; // ✅ Removes the "items" validation error
      return newErrors;
    });
  
    setMessage(null); // ✅ Remove any global message (including the "Please add at least one item before submitting.")
  
    setNewItem({ type: "", description: "", quantity: "", rate: "", discount: 0, unit: "" });
  };
  

  const editItem = (index) => {
    setNewItem(invoice.items[index]);
    setEditIndex(index);
  };

  const deleteItem = (index) => {
    setInvoice((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const validateFields = () => {
    const newErrors = {};
    if (!invoice.client_id) newErrors.client_id = "Client is required.";
    if (!invoice.issue_date) newErrors.issue_date = "Issue date is required.";
    if (!invoice.due_date) newErrors.due_date = "Due date is required.";
    if (invoice.due_date && invoice.issue_date && new Date(invoice.due_date) < new Date(invoice.issue_date)) {
      newErrors.due_date = "Due date cannot be earlier than issue date.";
    }
    if (invoice.issue_date && invoice.due_date && new Date(invoice.issue_date) > new Date(invoice.due_date)) {
      newErrors.issue_date = "Issue date cannot be later than due date.";
    }
    if (!invoice.currency) newErrors.currency = "Currency is required.";
    if (!invoice.payment_method) newErrors.payment_method = "Payment method is required.";
    if (!invoice.payment_details) newErrors.payment_details = "Payment details are required.";
    if (invoice.items.length === 0) newErrors.items = "At least one item is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      setMessage(<Alert severity="error">Please add at least one item before submitting.</Alert>); // ✅ Display message if no items
      return;
    }
  
    setIsRedirecting(true);
  
    try {
      const response = await fetch(`${API_URL}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(invoice),
      });
  
      if (!response.ok) throw new Error("Failed to create invoice");
  
      setMessage(<Alert severity="success">Invoice created successfully!</Alert>);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      setMessage(<Alert severity="error">Failed to create invoice. Please try again.</Alert>);
      setIsRedirecting(false);
    }
  };
  

  const handleSaveNewClient = async () => {
    setIsSavingClient(true);
    try {
      const response = await fetch(`${API_URL}/client`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) throw new Error("Failed to add client");

      const addedClient = await response.json();
      setClients((prev) => [...prev, addedClient]);
      setInvoice((prev) => ({ ...prev, client_id: addedClient.id }));
      setIsAddingClient(false);
      setNewClient({ name: "", business_name: "", email: "", phone: "", address: "", tax_number: "" });

      // Wait for a couple of seconds to ensure the new client appears in the dropdown
      setIsLoadingClients(true);
      setTimeout(() => {
        setIsLoadingClients(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding client:", error);
    }
    setIsSavingClient(false);
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
            {/* ✅ Client Selection */}
            {isLoadingClients ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <ClientSelection clients={clients} invoice={invoice} handleChange={handleChange} errors={errors} setIsAddingClient={setIsAddingClient} />
            )}

            {/* ✅ Invoice Form */}
            <TextField label="Issue Date *" type="date" name="issue_date" fullWidth margin="normal" value={invoice.issue_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.issue_date} helperText={errors.issue_date} />
            <TextField label="Due Date *" type="date" name="due_date" fullWidth margin="normal" value={invoice.due_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.due_date} helperText={errors.due_date} />

            <TextField select label="Currency *" name="currency" fullWidth margin="normal" value={invoice.currency} onChange={handleChange} error={!!errors.currency} helperText={errors.currency}>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
              {/* Add more currencies as needed */}
            </TextField>

            <TextField label="Tax (%)" type="number" name="tax_rate" fullWidth margin="normal" value={invoice.tax_rate} onChange={handleChange} inputProps={{ min: 0, max: 100 }} error={!!errors.tax_rate} helperText={errors.tax_rate} />

            <TextField select label="Payment Method *" name="payment_method" fullWidth margin="normal" value={invoice.payment_method} onChange={handleChange} error={!!errors.payment_method} helperText={errors.payment_method}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Check">Check</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
              <MenuItem value="Direct Debit">Direct Debit</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Stripe">Stripe</MenuItem>
              <MenuItem value="Barter Trade">Barter Trade</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Payment Details *"
              name="payment_details"
              fullWidth
              margin="normal"
              value={invoice.payment_details}
              onChange={handleChange}
              error={!!errors.payment_details}
              helperText={errors.payment_details}
              multiline
              rows={4}
            />

            <Typography variant="h6" sx={{ mt: 3 }}>Invoice Items</Typography>

            {/* ✅ Invoice Items Table */}
            <InvoiceItemsTable invoice={invoice} editItem={editItem} deleteItem={deleteItem} />
            {errors.items && <Alert severity="error" sx={{ my: 2 }}>{errors.items}</Alert>} {/* ✅ Show error if no items added */}

            {/* ✅ Invoice Item Form */}
            <InvoiceItemForm newItem={newItem} handleItemChange={handleItemChange} errors={errors} saveItem={saveItem} editIndex={editIndex} />

            {/* ✅ Confirmation Checkbox */}
            <FormControlLabel control={<Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} />} label="I hereby confirm that all the information provided is correct and true." sx={{ mt: 3 }} />

            {/* ✅ Invoice Summary & Submit */}
            <InvoiceSummary invoice={invoice} isConfirmed={isConfirmed} handleSubmit={handleSubmit} />
          </>
        )}
      </Paper>

      {/* ✅ New Client Dialog */}
      <NewClientDialog isAddingClient={isAddingClient} setIsAddingClient={setIsAddingClient} newClient={newClient} handleNewClientChange={handleNewClientChange} handleSaveNewClient={handleSaveNewClient} isSavingClient={isSavingClient} />
    </Container>
  );
};

export default CreateInvoice;