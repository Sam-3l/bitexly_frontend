import apiClient from "../utils/apiClient";

const AuthService = {
  // 🔹 Login
  login: async (email, password, userType = "user") => {
    try {
      const response = await apiClient.post("/users/signin/", {
        username: email, // backend still expects "username" field
        password,
        user_type: userType,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "An error occurred. Please try again.",
        }
      );
    }
  },

  // 🔹 Register (send signup OTP)
  signup: async (data) => {
    try {
      const response = await apiClient.post("/users/signup/", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Signup failed. Please try again." }
      );
    }
  },

  // 🔹 Verify OTP
  verifyOtp: async (data) => {
    try {
      const response = await apiClient.post("/users/verify-otp/", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Invalid OTP. Please retry." }
      );
    }
  },

  // 🔹 Complete Registration
  completeRegistration: async (data) => {
    try {
      const response = await apiClient.patch("/users/signup/", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Unable to complete registration." }
      );
    }
  },

  // 🔹 Forgot Password
  forgotPassword: async (data) => {
    try {
      const response = await apiClient.post("/users/forgot-password/", data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Password reset failed. Try again." }
      );
    }
  },
};

export default AuthService;