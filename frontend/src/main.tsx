import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/pages/LoginPage";
import SignupPage from "./app/pages/SignupPage";
import DashboardPage from "./app/pages/DashboardPage";
import ProfilePage from "./app/pages/ProfilePage";
import { ProtectedRoute } from "./app/components/ProtectedRoute";
import DiaGuardApp from "./app/DiaGuardApp";
import { Toaster } from "./app/components/ui/sonner";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DiaGuardApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </StrictMode>
);
