import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const TopClientLoyaltyCard = ({ client }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Top Client (Loyalty)
        </Typography>
        <Typography variant="h4">
          {client ? client.name : "N/A"}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {client ? `${client.invoiceCount} invoices` : ""}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TopClientLoyaltyCard;
