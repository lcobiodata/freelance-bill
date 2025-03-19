// import React, { useState } from "react";
// import { TextField, Button, Box, MenuItem } from "@mui/material";

// const InvoiceItemForm = ({ newItem, handleItemChange, errors, saveItem, editIndex }) => {
//   const [localErrors, setLocalErrors] = useState(errors);

//   const checkMandatoryFields = () => {
//     const mandatoryFields = ["type", "quantity", "unit", "description", "rate"];
//     const newErrors = {};
//     mandatoryFields.forEach(field => {
//       if (!newItem[field]) {
//         newErrors[field] = "This field is required";
//       }
//     });
//     return newErrors;
//   };

//   const handleSaveItem = () => {
//     const newErrors = checkMandatoryFields();
    
//     if (Object.keys(newErrors).length > 0) {
//       setLocalErrors(newErrors);
//     } else {
//       saveItem();
//       setLocalErrors({}); // ✅ Clear errors when at least one item is added
//     }
//   };

//   return (
//     <>
//       <TextField
//         select
//         label="Type *"
//         name="type"
//         fullWidth
//         margin="normal"
//         value={newItem.type || ""}
//         onChange={handleItemChange}
//         error={!!localErrors.type}
//         helperText={localErrors.type}
//       >
//         <MenuItem value="Product">Product</MenuItem>
//         <MenuItem value="Service">Service</MenuItem>
//       </TextField>

//       <TextField
//         label="Quantity *"
//         type="number"
//         name="quantity"
//         fullWidth
//         margin="normal"
//         value={newItem.quantity || ""}
//         onChange={handleItemChange}
//         error={!!localErrors.quantity}
//         helperText={localErrors.quantity}
//       />

//       <TextField
//         select
//         label="Unit *"
//         name="unit"
//         fullWidth
//         margin="normal"
//         value={newItem.unit || ""}
//         onChange={handleItemChange}
//         error={!!localErrors.unit}
//         helperText={localErrors.unit}
//       >
//         <MenuItem value="Item">Item</MenuItem>
//         <MenuItem value="Hour">Hour</MenuItem>
//       </TextField>

//       <TextField
//         label="Description *"
//         name="description"
//         fullWidth
//         margin="normal"
//         value={newItem.description || ""}
//         onChange={handleItemChange}
//         error={!!localErrors.description}
//         helperText={localErrors.description}
//       />

//       <TextField
//         label="Price/Rate *"
//         type="number"
//         name="rate"
//         fullWidth
//         margin="normal"
//         value={newItem.rate || ""}
//         onChange={handleItemChange}
//         error={!!localErrors.rate}
//         helperText={localErrors.rate}
//       />

//       <TextField
//         label="Discount (%)"
//         type="number"
//         name="discount"
//         fullWidth
//         margin="normal"
//         value={newItem.discount || ""}
//         onChange={handleItemChange}
//         inputProps={{ min: 0, max: 100 }}
//         error={!!localErrors.discount}
//         helperText={localErrors.discount}
//       />

//       <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
//         <Button variant="contained" color="primary" onClick={handleSaveItem}>
//           {editIndex !== null ? "Update Item" : "Add Item"}
//         </Button>
//       </Box>
//     </>
//   );
// };

// export default InvoiceItemForm;