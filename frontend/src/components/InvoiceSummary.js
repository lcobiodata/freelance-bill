import React from "react";
import { Box, Typography, Button, Card, CardContent, Divider, Grid } from "@mui/material";

const InvoiceSummary = ({ invoice, isConfirmed, handleSubmit }) => {
  // Ensure all numeric fields are properly initialized and converted to numbers
  const subtotal = Number(invoice.subtotal) || 0;
  const totalDiscount = Number(invoice.total_discount) || 0;
  const discountedPrice = subtotal - totalDiscount;
  const taxAmount = (Number(invoice.tax_amount) || 0) * discountedPrice / 100;
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