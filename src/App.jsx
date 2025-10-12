import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <Router>
      <AuthProvider>
          <AppRoutes />
      </AuthProvider>
    </Router>
  );
}