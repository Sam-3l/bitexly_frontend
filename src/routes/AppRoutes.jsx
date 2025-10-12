// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));

// Placeholder dashboard (we’ll build it soon)
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

export default function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}