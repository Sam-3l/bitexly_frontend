import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; // ✅ import ThemeProvider
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              success: {
                style: {
                  background: "#10B981",
                  color: "#fff",
                },
              },
              error: {
                style: {
                  background: "#EF4444",
                  color: "#fff",
                },
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}