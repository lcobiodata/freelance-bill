import React, { useEffect } from "react";
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
import CreateInvoice from "./components/CreateInvoice";
import AddClient from "./components/AddClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const clearTokenOnLoad = () => {
  localStorage.removeItem("token");
};

const App = () => {
  useEffect(() => {
    clearTokenOnLoad();
  }, []);

  return (
    <Router>
      <Navbar />
      <Container maxWidth={false} sx={{ py: 4, display: "inline-block" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verify-success" element={<EmailVerificationSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/create-invoice" element={<CreateInvoice />} />
          <Route path="/add-client" element={<AddClient />} />
        </Routes>
      </Container>
      <Footer />
    </Router>
  );
};

export default App;