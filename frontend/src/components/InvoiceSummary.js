import React from "react";
import { Box, Typography, Button, Card, CardContent, Divider, Grid } from "@mui/material";

const InvoiceSummary = ({ invoice, isConfirmed, handleSubmit }) => {
  // Ensure all numeric fields are properly initialized and converted to numbers
  const subtotal = Number(invoice.subtotal) || 0;
  const taxAmount = Number(invoice.tax_amount) || 0;
  const discount = Number(invoice.discount) || 0;
  const totalAmount = Number(invoice.total_amount) || 0;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Invoice Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body1">Subtotal:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">${subtotal.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Tax:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">${taxAmount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1">Discount:</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body1" align="right">${discount.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Total:</Typography>
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