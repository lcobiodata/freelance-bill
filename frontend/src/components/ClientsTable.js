import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from "@mui/material";
import { Link } from "react-router-dom";

export const ClientsTable = ({ clients, loading }) => (
  <>
    <TableContainer component={Paper} sx={{ height: 400, width: "100%", overflow: "auto" }}>
      <Table stickyHeader sx={{ minWidth: 800 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Business Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Address</TableCell>
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
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.business_name || "N/A"}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone || "N/A"}</TableCell>
                <TableCell>{client.address || "N/A"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
    <Button variant="contained" color="secondary" sx={{ mt: 2 }} component={Link} to="/add-client">
      Add Client
    </Button>
  </>
);
