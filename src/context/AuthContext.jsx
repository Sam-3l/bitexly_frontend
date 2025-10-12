import { createContext, useState, useEffect } from "react";
import AuthService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("bitexly_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    setUser(data);
    localStorage.setItem("bitexly_user", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bitexly_user");
  };

  useEffect(() => {
    // Potential refresh or validation logic can go here later
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};