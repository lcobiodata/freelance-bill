import React, { useState, useEffect } from "react";
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
  IconButton
} from "@mui/material";
import { Link } from "react-router-dom";
import { Add, Check, Close, Visibility } from "@mui/icons-material";

export const InvoicesTable = ({ invoices, loading, markAsPaid, markAsCancelled }) => {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    action: null, // "paid" or "cancelled"
    invoiceId: null,
  });

  const [localInvoices, setLocalInvoices] = useState(invoices); // Track status locally
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    // Sort invoices numerically by invoice number
    const sortedInvoices = [...invoices].sort((a, b) => a.invoice_number - b.invoice_number);
    setLocalInvoices(sortedInvoices);
  }, [invoices]);

  // Open confirmation dialog for marking Paid or Cancelled
  const handleOpenActionDialog = (invoiceId, action) => {
    setDialogConfig({ open: true, action, invoiceId });
  };

  const handleCloseActionDialog = () => {
    setDialogConfig({ open: false, action: null, invoiceId: null });
  };

  const handleConfirmAction = async () => {
    if (!dialogConfig.invoiceId) return;

    if (dialogConfig.action === "paid") {
      await markAsPaid(dialogConfig.invoiceId);
    } else if (dialogConfig.action === "cancelled") {
      await markAsCancelled(dialogConfig.invoiceId);
    }

    // Update local state to reflect status change (hides buttons)
    setLocalInvoices((prevInvoices) =>
      prevInvoices.map((invoice) =>
        invoice.id === dialogConfig.invoiceId
          ? { ...invoice, status: dialogConfig.action === "paid" ? "Paid" : "Cancelled" }
          : invoice
      )
    );

    handleCloseActionDialog();
  };

  const handleOpenItemsDialog = (items) => {
    setSelectedItems(items);
    setItemsDialogOpen(true);
  };

  const handleCloseItemsDialog = () => {
    setItemsDialogOpen(false);
    setSelectedItems([]);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
        <Table stickyHeader sx={{ minWidth: 1200 }}>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Tax Rate (%)</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Total Discount</TableCell>
              <TableCell>Tax Amount</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Payment Details</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={16} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              localInvoices.map((invoice) => (
                <TableRow key={invoice.invoice_number}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client || "Unknown"}</TableCell>
                  <TableCell>{invoice.issue_date}</TableCell>
                  <TableCell>{invoice.due_date}</TableCell>
                  <TableCell>{invoice.currency}</TableCell>
                  <TableCell>{invoice.tax_rate.toFixed(2)}</TableCell>
                  <TableCell>{invoice.subtotal.toFixed(2)}</TableCell>
                  <TableCell>{invoice.total_discount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.tax_amount.toFixed(2)}</TableCell>
                  <TableCell>{invoice.total_amount !== undefined ? Number(invoice.total_amount).toFixed(2) : "N/A"}</TableCell>
                  <TableCell>{invoice.payment_method}</TableCell>
                  <TableCell>{invoice.payment_details}</TableCell>
                  <TableCell>{invoice.payment_date}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenItemsDialog(invoice.items)}>
                      <Visibility />
                    </IconButton>
                  </TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell>
                    {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenActionDialog(invoice.id, "paid")}
                          sx={{ color: 'green' }}
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenActionDialog(invoice.id, "cancelled")}
                          sx={{ color: 'red' }}
                        >
                          <Close />
                        </IconButton>
                      </>
                    )}
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
        component={Link}
        to="/create-invoice"
        startIcon={<Add />}
      >
        Create Invoice
      </Button>

      {/* Generic Confirmation Dialog */}
      <Dialog open={dialogConfig.open} onClose={handleCloseActionDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this invoice as <strong>{dialogConfig.action === "paid" ? "Paid" : "Cancelled"}</strong>? <br />
            <strong>This action cannot be undone.</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={dialogConfig.action === "paid" ? "primary" : "error"}
            variant="contained"
          >
            Yes, Mark as {dialogConfig.action === "paid" ? "Paid" : "Cancelled"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Items Dialog */}
      <Dialog open={itemsDialogOpen} onClose={handleCloseItemsDialog}>
        <DialogTitle>Invoice Items</DialogTitle>
        <DialogContent>
          <Table size="small" aria-label="invoice-items">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price/Rate</TableCell>
                <TableCell>Discount (%)</TableCell>
                <TableCell>Gross Amount</TableCell>
                <TableCell>Net Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.rate}</TableCell>
                  <TableCell>{item.discount}</TableCell>
                  <TableCell>{(item.quantity * item.rate).toFixed(2)}</TableCell>
                  <TableCell>{((item.quantity * item.rate) * (1 - item.discount / 100)).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemsDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};