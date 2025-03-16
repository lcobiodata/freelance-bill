import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { Add } from "@mui/icons-material";

const ClientSelection = ({ clients, invoice, handleChange, errors, setIsAddingClient }) => {
  return (
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
      <MenuItem value="new" onClick={() => setIsAddingClient(true)}>
        <Add /> New client
      </MenuItem>
      {clients.map((client) => (
        <MenuItem key={client.id} value={client.id}>
          {client.name}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default ClientSelection;
