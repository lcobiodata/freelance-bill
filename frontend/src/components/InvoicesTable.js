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
          doc.setFontSize(20);
          doc.text("INVOICE", 105, 20, { align: "center" });
  
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
  
          // Business details
          doc.setFont("helvetica", "bold");
          doc.text(user.business_name || "Your Business Name", 20, 30);
          doc.setFont("helvetica", "normal");
          doc.text("Your Registered Business Address", 20, 35); // Placeholder
          doc.text(`Email: ${user.email || "Your Email"}`, 20, 40);
          doc.text(`Phone: ${user.phone || "Your Phone Number"}`, 20, 45);
          if (user.website) {
              doc.text(`Website: ${user.website}`, 20, 50);
          }
          doc.setFont("helvetica", "bold");
          doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 55);
  
          // Client details
          doc.setFont("helvetica", "bold");
          doc.text("Invoice To:", 20, 65);
          doc.setFont("helvetica", "normal");
          doc.text(client.name || "Client’s Name or Business Name", 20, 70);
          doc.text(client.address || "Client’s Address", 20, 75);
  
          // Invoice dates
          doc.setFont("helvetica", "bold");
          doc.text(`Invoice Date: ${invoice.issue_date}`, 20, 85);
          doc.text(`Payment Due By: ${invoice.due_date}`, 20, 90);
  
          // Table of items
          autoTable(doc, {
              startY: 100,
              head: [["Item", "Description", "Quantity", "Unit Price (£)", "Total (£)"]],
              body: invoice.items.map((item, index) => [
                  index + 1,
                  item.description,
                  item.quantity,
                  item.rate.toFixed(2),
                  (item.quantity * item.rate * (1 - item.discount / 100)).toFixed(2),
              ]),
              foot: [
                  ["", "", "", "Subtotal:", invoice.subtotal.toFixed(2)],
                  ["", "", "", "VAT (if applicable):", invoice.tax_amount.toFixed(2)],
                  ["", "", "", "Total Due:", invoice.total_amount.toFixed(2)],
              ],
          });
  
          // Payment details
          doc.setFont("helvetica", "bold");
          doc.text("Payment Details", 20, doc.lastAutoTable.finalY + 20);
          doc.setFont("helvetica", "normal");
          doc.text("Bank Name: Your Bank", 20, doc.lastAutoTable.finalY + 25); // Placeholder
          doc.text("Account Name: Your Name / Business Name", 20, doc.lastAutoTable.finalY + 30); // Placeholder
          doc.text("Sort Code: XX-XX-XX", 20, doc.lastAutoTable.finalY + 35); // Placeholder
          doc.text("Account Number: XXXX XXXX", 20, doc.lastAutoTable.finalY + 40); // Placeholder
  
          doc.setFont("helvetica", "bold");
          doc.text("Or Pay via PayPal / Stripe:", 20, doc.lastAutoTable.finalY + 50);
          doc.setFont("helvetica", "normal");
          doc.text("Your Payment Link", 20, doc.lastAutoTable.finalY + 55); // Placeholder
  
          // Legal notes
          doc.setFont("helvetica", "bold");
          doc.text("Legal Notes", 20, doc.lastAutoTable.finalY + 65);
          doc.setFont("helvetica", "normal");
          doc.text("If not VAT registered, include: “Not VAT Registered”.", 20, doc.lastAutoTable.finalY + 70);
          doc.text("[Your Brand Name] is a registered trademark of [Your Name].", 20, doc.lastAutoTable.finalY + 75); // Placeholder
          doc.text("Payment terms: Payment due within 14 days of invoice date.", 20, doc.lastAutoTable.finalY + 80);
  
          doc.text("Thank you for your business! Please contact us for any questions regarding this invoice.", 20, doc.lastAutoTable.finalY + 90);
  
          // Apply watermark if needed
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
              doc.setGState(new doc.GState({ opacity: 0.1 })); // Apply transparency (0.1 = 10% opacity)
              doc.setTextColor(...watermarkColor);
              
              // Set font size as 90 if cancelled and 120 if paid
              doc.setFontSize(watermarkText === "CANCELLED" ? 90 : 120);
              doc.setFont("helvetica", "bold");
  
              // Get center position for the watermark
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();

              doc.text(watermarkText, 210 * pageWidth / 297, 210 * pageHeight / 297, {
                  align: "center",
                  angle: 54.46,
              });
  
              doc.setGState(new doc.GState({ opacity: 1 })); // Restore full opacity
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