import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { Container } from "@mui/material";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import EmailVerificationSuccess from "./components/EmailVerificationSuccess";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import InvoiceForm from "./components/InvoiceForm";
import ClientForm from "./components/ClientForm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const API_URL = process.env.REACT_APP_API_URL;

const clearTokenOnLoad = () => {
  localStorage.removeItem("token");
};

export const fetchUserDetails = async (setUser, setLoadingUser) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("No token found in localStorage");
    return;
  }

  setLoadingUser(true);
  try {
    const response = await fetch(`${API_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Failed to fetch user details:", response.statusText);
      throw new Error(response.statusText);
    }
    const userData = await response.json();
    console.log("Fetched user details:", userData);
    setUser(userData);
  } catch (error) {
    console.error("Error fetching user details:", error);
    setUser(null);
  }
  setLoadingUser(false);
};

export const updateUserDetails = async (updatedData, fetchUserDetails) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Failed to update user details");
    fetchUserDetails();
  } catch (error) {
    console.error(error);
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    clearTokenOnLoad();
    fetchUserDetails(setUser, setLoadingUser);
  }, []);

  return (
    <Router>
      <Navbar user={user} loadingUser={loadingUser} />
      <Container maxWidth={false} sx={{ py: 4, display: "inline-block" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard user={user} loadingUser={loadingUser} updateUserDetails={(data) => updateUserDetails(data, () => fetchUserDetails(setUser, setLoadingUser))} />} />
          <Route path="/verify-success" element={<EmailVerificationSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/create-invoice" element={<InvoiceForm />} />
          <Route path="/add-client" element={<ClientForm />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
};

export default App;