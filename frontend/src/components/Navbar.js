import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box, Popover, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { fetchUserDetails } from "../App";
import { ProfileCard } from "./ProfileCard"; // Import the ProfileCard component

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null); // State for Popover anchor
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // State for logout confirmation dialog
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      fetchUserDetails(setUser, setLoadingUser);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSnackbarOpen(true); // Show the Snackbar
    setTimeout(() => {
      navigate("/login"); // Redirect to login after showing the message
    }, 2000); // Delay for 2 seconds
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true); // Open the confirmation dialog
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false); // Close the dialog
    handleLogout(); // Perform logout
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false); // Close the dialog without logging out
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Close the Snackbar
  };

  const getUserInitial = () => {
    if (!user) return "";
    return user.name.charAt(0).toUpperCase();
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'profile-popover' : undefined;

  return (
    <>
      <AppBar position="static" color="primary" sx={{ boxShadow: 3 }}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            FreelanceBill
          </Typography>
          {token ? (
            <>
              {location.pathname !== "/dashboard" && (
                <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}></Button>
              )}
              <IconButton color="inherit" onClick={handleLogoutClick}>
                <ExitToAppIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleAvatarClick}>
                <Avatar sx={{ mx: 2 }}>{getUserInitial()}</Avatar>
              </IconButton>
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <ProfileCard user={user} loading={loadingUser} />
              </Popover>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Button color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}></Button>
              )}
              {location.pathname !== "/register" && (
                <Button color="inherit" component={Link} to="/register" startIcon={<PersonAddIcon />}></Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Logout Message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: '100%' }}>
          See you soon, bye!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navbar;