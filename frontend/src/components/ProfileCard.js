import React, { useState, useEffect } from "react";
import { TextField, Button, Box, CircularProgress, Paper, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Grid } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit Icon

export const ProfileCard = ({ user, loading, updateUser }) => {
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
    <Paper elevation={4} sx={{ p: 4, display: 'flex', flexDirection: 'column', maxWidth: 200, mx: 'auto' }}>
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
            {[
              { label: "Full Name", value: user.name },
              { label: "Business Name", value: user.business_name },
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone },
              { label: "Address", value: user.address },
              { label: "Tax Number", value: user.tax_number },
            ].map(({ label, value }) => (
              <Grid item xs={12} key={label}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {label}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>
                  {value || "—"}
                </Typography>
              </Grid>
            ))}
          </Grid>

          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<EditIcon />} 
            onClick={handleOpenDialog} 
            sx={{ mt: 'auto' }}
          >
            Edit Profile
          </Button>

          {/* Edit Profile Dialog */}
          <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                {[
                  { label: "Full Name", name: "name" },
                  { label: "Business Name", name: "business_name" },
                  { label: "Phone", name: "phone" },
                  { label: "Address", name: "address" },
                  { label: "Tax Number", name: "tax_number" },
                ].map(({ label, name }) => (
                  <TextField
                    key={name}
                    label={label}
                    name={name}
                    fullWidth
                    margin="normal"
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                ))}

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={formData.email}
                  disabled
                />
              </form>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog} variant="outlined" color="secondary" disabled={isSaving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                color="primary" 
                variant="contained" 
                disabled={isSaving}
              >
                {isSaving ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  );
};