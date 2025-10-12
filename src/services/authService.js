// src/services/authService.js
import apiClient from "../utils/apiClient";

const AuthService = {
  login: async (username, password, userType = "user") => {
    try {
      const response = await apiClient.post("/signin/", {
        username,
        password,
        user_type: userType,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data ||
        { message: "An error occurred. Please try again." }
      );
    }
  },
};

export default AuthService;