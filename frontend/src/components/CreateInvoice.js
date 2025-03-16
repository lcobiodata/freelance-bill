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

  const saveItem = () => {
    if (!newItem.type || !newItem.description || !newItem.quantity || !newItem.rate) {
      setErrors((prev) => ({ ...prev, type: "Type is required.", description: "Description is required." }));
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
    setNewItem({ type: "", description: "", quantity: "", rate: "", discount: 0, unit: "" });
  };

  const editItem = (index) => {
    setNewItem(invoice.items[index]);
    setEditIndex(index);
  };

  const deleteItem = (index) => {
    setInvoice((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  // ✅ Fix: Ensure new client state updates correctly
  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Fix: Correctly handle saving a new client
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
  
      // ✅ Update the state immediately
      setClients((prev) => [...prev, addedClient]);
      setInvoice((prev) => ({ ...prev, client_id: addedClient.id }));
  
      // ✅ Fetch fresh client list (ensure full sync)
      await fetchClients();
  
      // ✅ Close the modal and reset form
      setIsAddingClient(false);
      setNewClient({ name: "", business_name: "", email: "", phone: "", address: "", tax_number: "" });
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
            <ClientSelection clients={clients} invoice={invoice} handleChange={handleChange} errors={errors} setIsAddingClient={setIsAddingClient} />

            {/* ✅ Invoice Form */}
            <TextField label="Issue Date *" type="date" name="issue_date" fullWidth margin="normal" value={invoice.issue_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.issue_date} helperText={errors.issue_date} />
            <TextField label="Due Date *" type="date" name="due_date" fullWidth margin="normal" value={invoice.due_date} onChange={handleChange} InputLabelProps={{ shrink: true }} error={!!errors.due_date} helperText={errors.due_date} />

            <TextField label="Tax (%)" type="number" name="tax_rate" fullWidth margin="normal" value={invoice.tax_rate} onChange={handleChange} inputProps={{ min: 0, max: 100 }} error={!!errors.tax_rate} helperText={errors.tax_rate} />

            <TextField select label="Payment Method *" name="payment_method" fullWidth margin="normal" value={invoice.payment_method} onChange={handleChange} error={!!errors.payment_method} helperText={errors.payment_method}>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="PayPal">PayPal</MenuItem>
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
            </TextField>

            <Typography variant="h6" sx={{ mt: 3 }}>Invoice Items</Typography>

            {/* ✅ Invoice Items Table */}
            <InvoiceItemsTable invoice={invoice} editItem={editItem} deleteItem={deleteItem} />

            {/* ✅ Invoice Item Form */}
            <InvoiceItemForm newItem={newItem} handleItemChange={handleItemChange} errors={errors} saveItem={saveItem} editIndex={editIndex} />

            {/* ✅ Confirmation Checkbox */}
            <FormControlLabel control={<Checkbox checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} />} label="I hereby confirm that all the information provided is correct and true." sx={{ mt: 3 }} />

            {/* ✅ Invoice Summary & Submit */}
            <InvoiceSummary invoice={invoice} isConfirmed={isConfirmed} handleSubmit={handleSubmit} />
          </>
        )}
      </Paper>

      {/* ✅ Fixed New Client Dialog */}
      <NewClientDialog isAddingClient={isAddingClient} setIsAddingClient={setIsAddingClient} newClient={newClient} handleNewClientChange={handleNewClientChange} handleSaveNewClient={handleSaveNewClient} isSavingClient={isSavingClient} />
    </Container>
  );
};

export default CreateInvoice;
