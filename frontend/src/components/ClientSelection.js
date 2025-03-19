// import React from "react";
// import { TextField, MenuItem } from "@mui/material";
// import { Add } from "@mui/icons-material";

// const ClientSelection = ({ clients, invoice, handleChange, errors, setIsAddingClient }) => {
//   const handleSelectChange = (e) => {
//     const { value } = e.target;
    
//     if (value === "new") {
//       setIsAddingClient(true); // ✅ Open "New Client" modal
//       return; // ✅ Prevents setting "new" as client_id
//     }

//     handleChange(e); // ✅ Update client_id normally
//   };

//   return (
//     <TextField
//       select
//       label="Select Client *"
//       name="client_id"
//       fullWidth
//       margin="normal"
//       value={invoice.client_id || ""}
//       onChange={handleSelectChange} // ✅ Uses the new function
//       error={!!errors.client_id}
//       helperText={errors.client_id}
//     >
//       <MenuItem value="new" onClick={() => setIsAddingClient(true)}>
//         <Add /> New client
//       </MenuItem>

//       {/* ✅ Display Name + (Business Name) ONLY if business_name exists */}
//       {clients.map((client) => (
//         <MenuItem key={client.id} value={client.id}>
//           {client.business_name ? `${client.name} (${client.business_name})` : client.name}
//         </MenuItem>
//       ))}
//     </TextField>
//   );
// };

// export default ClientSelection;
