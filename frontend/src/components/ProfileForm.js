import React, { useState, useEffect } from "react";
import { 
  TextField, Button, Box, CircularProgress, Paper, Typography, 
  Dialog, DialogActions, DialogContent, DialogTitle, Grid, Divider 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

export const ProfileForm = ({ user, loading, updateUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    address: "",
    tax_number: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        business_name: user.business_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        tax_number: user.tax_number || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUser(formData);
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500, mx: "auto", borderRadius: 2 }}>
    <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
        Profile Information
    </Typography>
    <Divider sx={{ mb: 2 }} />

    <Grid container spacing={2}>
        {[
        { label: "Full Name", value: user.name },
        { label: "Business Name", value: user.business_name },
        { label: "Email", value: user.email },
        { label: "Phone", value: user.phone },
        { label: "Address", value: user.address },
        { label: "Tax Number", value: user.tax_number },
        ].map((item, index) => (
        <Grid item xs={12} sm={6} key={index}>
            <Typography variant="subtitle2" fontWeight="bold">
            {item.label}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", wordBreak: "break-word" }}>
            {item.value || "N/A"}
            </Typography>
        </Grid>
        ))}
    </Grid>

    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsDialogOpen(true)}>
        Edit Profile
        </Button>
    </Box>
    </Paper>
  );
};
