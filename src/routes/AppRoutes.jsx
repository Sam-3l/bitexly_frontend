// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { lazy, Suspense, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Lazy load pages for better performance
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

export default function AppRoutes() {
  const { user } = useContext(AuthContext);

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
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />

        {/* Protected Main App Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}