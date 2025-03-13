import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from "@mui/material";
import { Link } from "react-router-dom"; // Import Link from react-router-dom

export const InvoicesTable = ({ invoices, loading, markAsPaid }) => (
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
                <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  {invoice.status !== "Paid" && (
                    <Button variant="contained" onClick={() => markAsPaid(invoice.invoice_number)}>
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
  </>
);