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
import { Add, Check, Close, Visibility, Print, Download } from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL;

export const InvoicesTable = ({ invoices, loading, markAsPaid, markAsCancelled, user }) => {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    action: null, // "paid" or "cancelled"
    invoiceId: null,
  });

  const [localInvoices, setLocalInvoices] = useState(invoices); // Track status locally
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

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

  const generatePDF = async (invoice) => {
    try {
      // Fetch client details from the API
      const response = await fetch(`${API_URL}/clients/${invoice.client_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch client details");
      }
  
      const client = await response.json();
  
      // Create PDF Document
      const doc = new jsPDF();
  
      // Business & Client Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Invoice", 105, 15, { align: "center" });
  
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
  
      doc.text(`Issued by: ${user.business_name || "Your Business Name"}`, 20, 30);
      doc.text(`Client: ${client.name || "Unknown"}`, 20, 40);
      doc.text(`Business: ${client.business_name || "N/A"}`, 20, 50);
      doc.text(`Email: ${client.email || "N/A"}`, 20, 60);
      doc.text(`Address: ${client.address || "N/A"}`, 20, 70);
      doc.text(`Tax Number: ${client.tax_number || "N/A"}`, 20, 80);
  
      // Invoice Details
      doc.text(`Invoice #${invoice.invoice_number}`, 140, 30);
      doc.text(`Issue Date: ${invoice.issue_date}`, 140, 40);
      doc.text(`Due Date: ${invoice.due_date}`, 140, 50);
      doc.text(`Currency: ${invoice.currency}`, 140, 60);
      doc.text(`Total Amount: ${invoice.total_amount.toFixed(2)}`, 140, 70);
      doc.text(`Payment Method: ${invoice.payment_method}`, 140, 80);
  
      // Invoice Items Table
      autoTable(doc, {
        startY: 100,
        head: [["Type", "Description", "Quantity", "Unit", "Rate", "Discount", "Total"]],
        body: invoice.items.map((item) => [
          item.type,
          item.description,
          item.quantity,
          item.unit,
          item.rate.toFixed(2),
          `${item.discount.toFixed(2)}%`,
          (item.quantity * item.rate * (1 - item.discount / 100)).toFixed(2),
        ]),
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], halign: "center" },
        columnStyles: {
          2: { halign: "center" },
          3: { halign: "center" },
          4: { halign: "right" },
          5: { halign: "right" },
          6: { halign: "right" },
        },
      });
  
      // ✅ Apply Watermark (PAID or CANCELLED)
      let watermarkText = "";
      let watermarkColor = [];
  
      if (invoice.status === "Paid") {
        watermarkText = "PAID";
        watermarkColor = [0, 128, 0]; // Green
      } else if (invoice.status === "Cancelled") {
        watermarkText = "CANCELLED";
        watermarkColor = [255, 0, 0]; // Red
      }
  
      if (watermarkText) {
        doc.setTextColor(...watermarkColor);
        doc.setFontSize(80);
        doc.setFont("helvetica", "bold");
  
        // Get center position for the watermark
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
  
        doc.saveGraphicsState();  // Preserve current settings
        doc.setGState(new doc.GState({ opacity: 0.2 })); // Apply transparency (20%)
  
        doc.text(watermarkText, pageWidth / 2, pageHeight / 2, {
          align: "center",
          angle: 45,
        });
  
        doc.restoreGraphicsState(); // Restore settings
      }
  
      // Generate and open the PDF
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setPdfDialogOpen(true);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
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
                    {/* Always show the "Print" button */}
                    <IconButton color="primary" onClick={() => generatePDF(invoice)}>
                      <Print />
                    </IconButton>

                    {/* Only show "Mark as Paid" and "Cancel" buttons for unpaid invoices */}
                    {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenActionDialog(invoice.id, "paid")}
                          sx={{ color: "green" }}
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenActionDialog(invoice.id, "cancelled")}
                          sx={{ color: "red" }}
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
      {/* PDF Preview Dialog */}
      <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Invoice PDF Preview</DialogTitle>
        <DialogContent>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="500px" />}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Download />}
            variant="contained"
            color="primary"
            onClick={() => window.open(pdfUrl, "_blank")}
          >
            Download
          </Button>
          <Button onClick={() => setPdfDialogOpen(false)} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};