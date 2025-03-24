import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { fetchUserDetails } from "../App";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
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
    navigate("/login");
  };

  const getUserInitial = () => {
    if (!user) return "";
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <AppBar position="static" color="primary" sx={{ boxShadow: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          FreelanceBill
        </Typography>
        {token ? (
          <>
            {location.pathname !== "/dashboard" && (
              <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}></Button>
            )}
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToAppIcon />
            </IconButton>
            <Avatar sx={{ mx: 2 }}>{getUserInitial()}</Avatar>
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
  );
};

export default Navbar;