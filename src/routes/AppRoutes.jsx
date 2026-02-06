import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { lazy, Suspense, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Lazy load pages for better performance
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const TransactionHistory = lazy(() => import("../pages/transactions/TransactionHistory"));
const Home = lazy(() => import("../pages/Home"));
const Contact = lazy(() => import("../pages/Contact"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Lazy load legal pages
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CookiesPolicy = lazy(() => import("../pages/CookiesPolicy"));
const TermsOfUse = lazy(() => import("../pages/TermsOfUse"));

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
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Contact Page */}
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          }
        />

        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookies-policy" element={<CookiesPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}