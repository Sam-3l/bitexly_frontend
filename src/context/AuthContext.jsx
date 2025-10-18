import { createContext, useState, useEffect, useCallback } from "react";
import AuthService from "../services/authService";
import apiClient from "../utils/apiClient";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("bitexly_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem("bitexly_tokens");
    return savedTokens ? JSON.parse(savedTokens) : null;
  });

  // Fetch user details
  const fetchUserDetails = useCallback(async (accessToken) => {
    try {
      apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
      const response = await apiClient.get("/users/getDetails/");
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("bitexly_user", JSON.stringify(userData));
    } catch (err) {
      toast.error("Failed to fetch user details.");
      console.error(err);
    }
  }, []);

  // Login
  const login = async (data) => {
    const { tokens } = data;
    setTokens(tokens);
    localStorage.setItem("bitexly_tokens", JSON.stringify(tokens));
    apiClient.defaults.headers.Authorization = `Bearer ${tokens.access}`;

    // Fetch actual user details
    await fetchUserDetails(tokens.access);
    toast.success("Logged in successfully");
  };

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("bitexly_user");
    localStorage.removeItem("bitexly_tokens");
    delete apiClient.defaults.headers.Authorization;
    toast.success("You’ve been logged out");
    setTimeout(() => (window.location.href = "/login"), 800);
  }, []);

  // Refresh token
  const refreshAccessToken = useCallback(async () => {
    if (!tokens?.refresh) return logout();

    try {
      const newAccess = await AuthService.refreshToken(tokens.refresh);
      const updatedTokens = { ...tokens, access: newAccess };
      setTokens(updatedTokens);
      localStorage.setItem("bitexly_tokens", JSON.stringify(updatedTokens));
      apiClient.defaults.headers.Authorization = `Bearer ${newAccess}`;

      // Re-fetch user details after refreshing access token
      await fetchUserDetails(newAccess);
    } catch {
      toast.error("Session expired. Please log in again.");
      logout();
    }
  }, [tokens, logout, fetchUserDetails]);

  // Auto attach token to axios + auto refresh
  useEffect(() => {
    if (tokens?.access) {
      apiClient.defaults.headers.Authorization = `Bearer ${tokens.access}`;
      fetchUserDetails(tokens.access);
    }

    const interval = setInterval(refreshAccessToken, 14 * 60 * 1000); // every 14 mins
    return () => clearInterval(interval);
  }, [tokens, refreshAccessToken, fetchUserDetails]);

  return (
    <AuthContext.Provider value={{ user, login, logout, tokens }}>
      {children}
    </AuthContext.Provider>
  );
};