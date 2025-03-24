import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DashboardIcon from '@mui/icons-material/Dashboard';

const Navbar = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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