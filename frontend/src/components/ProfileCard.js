import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControl,
  FormLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export const ProfileCard = ({ user, loading, updateUserDetails }) => {
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postCode: "",
    tax_number: "",
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      const [address, city, country, postCode] = (user.address || "").split(", ").map((field) => field.trim());
      setFormData({
        name: user.name || "",
        business_name: user.business_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: address || "",
        city: city || "",
        country: country || "",
        postCode: postCode || "",
        tax_number: user.tax_number || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (phone) => {
    setFormData({ ...formData, phone });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate required fields
    if (!formData.address || !formData.city || !formData.country) {
      setErrorMessage("Address, City, and Country are required fields.");
      return;
    }

    setIsSaving(true);

    // Combine address fields into a single string
    const fullAddress = [formData.address, formData.city, formData.country, formData.postCode]
      .filter((field) => field && field.trim() !== "")
      .join(", ");

    await updateUserDetails({ ...formData, address: fullAddress });
    setIsSaving(false);
    setIsDialogOpen(false);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setErrorMessage("");
  };

  return (
    <Paper elevation={4} sx={{ p: 4, display: 'flex', flexDirection: 'column', maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
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
              {errorMessage && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {errorMessage}
                </Typography>
              )}
              <form onSubmit={handleSubmit}>
                {[
                  { label: "Full Name", name: "name" },
                  { label: "Business Name", name: "business_name" },
                  { label: "Tax Number", name: "tax_number" },
                  { label: "Address", name: "address", required: true },
                  { label: "City", name: "city", required: true },
                  { label: "Country", name: "country", required: true },
                  { label: "Post Code", name: "postCode" },
                ].map(({ label, name, required }) => (
                  <TextField
                    key={name}
                    label={label}
                    name={name}
                    fullWidth
                    margin="normal"
                    value={formData[name]}
                    onChange={handleChange}
                    disabled={isSaving}
                    required={required}
                  />
                ))}

                <Box sx={{ mt: 2, textAlign: "left" }}>
                  <PhoneInput
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputStyle={{
                      width: "100%",
                      height: "56px", // Match Material-UI TextField height
                      borderRadius: "4px",
                      border: "1px solid rgba(0, 0, 0, 0.23)", // Match Material-UI TextField border
                      paddingLeft: "48px", // Adjust for country code dropdown
                    }}
                    placeholder="Phone number"
                    required
                  />
                </Box>

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