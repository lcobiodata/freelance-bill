import React from "react";
import { Box, Typography, Button, Card, CardContent, Divider, Grid } from "@mui/material";

const InvoiceSummary = ({ invoice, isConfirmed, handleSubmit }) => {
  // Ensure items exist and are properly iterated over
  const items = invoice.items || [];

  // Calculate subtotal, total discount, and tax dynamically
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.discount / 100)), 0);
  const discountedPrice = subtotal - totalDiscount;
  const taxAmount = (Number(invoice.tax_rate) || 0) * discountedPrice / 100; // Use invoice.tax_rate
  const totalAmount = discountedPrice + taxAmount;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Invoice Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Subtotal (Base Price):</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">${subtotal.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Total Discount:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">-${totalDiscount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Tax:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">${taxAmount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total Amount Due:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" align="right">${totalAmount.toFixed(2)}</Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isConfirmed}
          >
            Submit Invoice
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummary;