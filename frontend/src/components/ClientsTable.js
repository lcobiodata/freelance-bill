import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Button, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField
} from "@mui/material";
import { Edit, Add } from "@mui/icons-material";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export const ClientsTable = ({ clients, loading, fetchClients }) => {
  const [editingClient, setEditingClient] = useState(null);
  const [editedClient, setEditedClient] = useState({});
  const [isAdding, setIsAdding] = useState(false); // State to differentiate between adding and editing

  // Open the edit dialog
  const handleEditClick = (client) => {
    setEditingClient(client);
    setEditedClient(client);
    setIsAdding(false);
  };

  // Open the add dialog
  const handleAddClick = () => {
    setEditingClient({});
    setEditedClient({});
    setIsAdding(true);
  };

  // Update field values in state
  const handleFieldChange = (e) => {
    setEditedClient({ ...editedClient, [e.target.name]: e.target.value });
  };

  // Save changes to the API
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving

  const handleSaveChanges = async () => {
    setIsSaving(true); // Show loading spinner

    try {
      const method = isAdding ? "POST" : "PUT";
      const url = isAdding ? `${API_URL}/client` : `${API_URL}/clients/${editingClient.id}`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editedClient),
      });

      setTimeout(() => {
        fetchClients(); // Delay refresh for 2 seconds
        setIsSaving(false); // Hide spinner
        setEditingClient(null); // Close dialog after delay
      }, 2000);
    } catch (error) {
      console.error("Error saving client:", error);
      setIsSaving(false); // Ensure spinner stops on error
    }
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell> {/* New Column for Edit Button */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
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
                  <TableCell>
                    {/* Edit Button */}
                    <IconButton onClick={() => handleEditClick(client)} color="primary">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        component={Link} to="/add-client"
        // onClick={handleAddClick}
        startIcon={<Add />}
      >
        Add Client
      </Button>

      {/* Edit/Add Dialog */}
      <Dialog open={!!editingClient} onClose={() => setEditingClient(null)}>
        <DialogTitle>{isAdding ? "Add Client" : "Edit Client"}</DialogTitle>
        <DialogContent>
          <TextField label="Name" name="name" fullWidth margin="normal"
            value={editedClient.name || ""} onChange={handleFieldChange} required />
          <TextField label="Business Name" name="business_name" fullWidth margin="normal"
            value={editedClient.business_name || ""} onChange={handleFieldChange} />
          <TextField label="Email" name="email" fullWidth margin="normal"
            value={editedClient.email || ""} onChange={handleFieldChange} required />
          <TextField label="Phone" name="phone" fullWidth margin="normal"
            value={editedClient.phone || ""} onChange={handleFieldChange} />
          <TextField label="Address" name="address" fullWidth margin="normal"
            value={editedClient.address || ""} onChange={handleFieldChange} />
          <TextField label="Tax Number" name="tax_number" fullWidth margin="normal"
            value={editedClient.tax_number || ""} onChange={handleFieldChange} /> {/* Add Tax Number field */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingClient(null)} color="secondary">Cancel</Button>
          <Button 
            onClick={handleSaveChanges} 
            color="primary" 
            variant="contained" 
            disabled={isSaving} // Disable while saving
          >
            {isSaving ? <CircularProgress size={24} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};