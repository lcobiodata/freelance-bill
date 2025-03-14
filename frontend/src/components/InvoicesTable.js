import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Link } from "react-router-dom";

export const InvoicesTable = ({ invoices, loading, markAsPaid }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleOpenDialog = (invoiceId) => {
    setSelectedInvoice(invoiceId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvoice(null);
  };

  const handleConfirmMarkAsPaid = () => {
    if (selectedInvoice) {
      markAsPaid(selectedInvoice);
    }
    handleCloseDialog();
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.invoice_number}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client || "Unknown"}</TableCell>
                  <TableCell>
                    ${invoice.total_amount !== undefined ? Number(invoice.total_amount).toFixed(2) : "N/A"}
                  </TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>
                    {invoice.status !== "Paid" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog(invoice.invoice_number)}
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Button variant="contained" color="secondary" sx={{ mt: 2 }} component={Link} to="/create-invoice">
        Create Invoice
      </Button>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this invoice as paid? <br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmMarkAsPaid} color="primary" variant="contained">
            Yes, Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
