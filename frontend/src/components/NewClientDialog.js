import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress } from "@mui/material";

const NewClientDialog = ({ isAddingClient, setIsAddingClient, newClient, handleNewClientChange, handleSaveNewClient, isSavingClient }) => {
  return (
    <Dialog open={isAddingClient} onClose={() => setIsAddingClient(false)}>
      <DialogTitle>Add Client</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          name="name"
          fullWidth
          margin="normal"
          value={newClient?.name || ""}
          onChange={handleNewClientChange}
          required
        />
        <TextField
          label="Business Name"
          name="business_name"
          fullWidth
          margin="normal"
          value={newClient?.business_name || ""}
          onChange={handleNewClientChange}
        />
        <TextField
          label="Email"
          name="email"
          fullWidth
          margin="normal"
          value={newClient?.email || ""}
          onChange={handleNewClientChange}
          required
        />
        <TextField
          label="Phone"
          name="phone"
          fullWidth
          margin="normal"
          value={newClient?.phone || ""}
          onChange={handleNewClientChange}
        />
        <TextField
          label="Address"
          name="address"
          fullWidth
          margin="normal"
          value={newClient?.address || ""}
          onChange={handleNewClientChange}
        />
        <TextField
          label="Tax Number"
          name="tax_number"
          fullWidth
          margin="normal"
          value={newClient?.tax_number || ""}
          onChange={handleNewClientChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddingClient(false)} color="secondary">Cancel</Button>
        <Button onClick={handleSaveNewClient} color="primary" variant="contained" disabled={isSavingClient}>
          {isSavingClient ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewClientDialog;
