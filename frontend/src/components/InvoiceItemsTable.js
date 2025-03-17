import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const InvoiceItemsTable = ({ invoice, editItem, deleteItem }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Price/Rate</TableCell>
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
              <TableCell>{Number(item.grossAmount).toFixed(2)}</TableCell>
              <TableCell>{Number(item.netAmount).toFixed(2)}</TableCell>
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
  );
};

export default InvoiceItemsTable;
