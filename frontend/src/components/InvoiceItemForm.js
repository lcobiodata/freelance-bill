import React from "react";
import { TextField, Button, Box, MenuItem } from "@mui/material";

const InvoiceItemForm = ({ newItem, handleItemChange, errors, saveItem, editIndex }) => {
  return (
    <>
      <TextField
        select
        label="Type *"
        name="type"
        fullWidth
        margin="normal"
        value={newItem.type || ""}
        onChange={handleItemChange}
        error={!!errors.type}
        helperText={errors.type}
      >
        <MenuItem value="Product">Product</MenuItem>
        <MenuItem value="Service">Service</MenuItem>
      </TextField>

      <TextField label="Quantity *" type="number" name="quantity" fullWidth margin="normal"
        value={newItem.quantity} onChange={handleItemChange}
        error={!!errors.quantity} helperText={errors.quantity} />

      <TextField select label="Unit *" name="unit" fullWidth margin="normal"
        value={newItem.unit} onChange={handleItemChange}
        error={!!errors.unit} helperText={errors.unit} >
        <MenuItem value="Item">Item</MenuItem>
        <MenuItem value="Hour">Hour</MenuItem>
      </TextField>

      <TextField label="Description *" name="description" fullWidth margin="normal"
        value={newItem.description} onChange={handleItemChange}
        error={!!errors.description} helperText={errors.description} />

      <TextField label="Price/Rate *" type="number" name="rate" fullWidth margin="normal"
        value={newItem.rate} onChange={handleItemChange}
        error={!!errors.rate} helperText={errors.rate} />

      <TextField label="Discount (%)" type="number" name="discount" fullWidth margin="normal"
        value={newItem.discount} onChange={handleItemChange} inputProps={{ min: 0, max: 100 }}
        error={!!errors.discount} helperText={errors.discount} />

      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
        <Button variant="contained" color="primary" onClick={saveItem}>
          {editIndex !== null ? "Update Item" : "Add Item"}
        </Button>
      </Box>
    </>
  );
};

export default InvoiceItemForm;
