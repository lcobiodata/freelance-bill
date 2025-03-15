import React, { useState, useEffect } from "react";
import { TextField, Button, Box, CircularProgress, Paper, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";

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

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Full Name:</strong></Typography>
              <Typography variant="body2">{user.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Business Name:</strong></Typography>
              <Typography variant="body2">{user.business_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Email:</strong></Typography>
              <Typography variant="body2">{user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Phone:</strong></Typography>
              <Typography variant="body2">{user.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Address:</strong></Typography>
              <Typography variant="body2">{user.address}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Tax Number:</strong></Typography>
              <Typography variant="body2">{user.tax_number}</Typography>
            </Grid>
          </Grid>
          <Button variant="contained" onClick={handleOpenDialog}>
            Edit Profile
          </Button>

          <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Full Name"
                  name="name"
                  fullWidth
                  margin="normal"
                  value={formData.name}
                  onChange={handleChange}
                />
                <TextField
                  label="Business Name"
                  name="business_name"
                  fullWidth
                  margin="normal"
                  value={formData.business_name}
                  onChange={handleChange}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                />
                <TextField
                  label="Phone"
                  name="phone"
                  fullWidth
                  margin="normal"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  label="Address"
                  name="address"
                  fullWidth
                  margin="normal"
                  value={formData.address}
                  onChange={handleChange}
                />
                <TextField
                  label="Tax Number"
                  name="tax_number"
                  fullWidth
                  margin="normal"
                  value={formData.tax_number}
                  onChange={handleChange}
                />
                <DialogActions>
                  <Button onClick={handleCloseDialog} color="secondary" disabled={isSaving}>Cancel</Button>
                  <Button type="submit" color="primary" variant="contained" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : "Save Changes"}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Paper>
  );
};