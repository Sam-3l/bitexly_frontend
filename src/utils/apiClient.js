// src/utils/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.mintcoins.pro",
  headers: {
    "Content-Type": "application/json",
  },
});

// You can later inject interceptors here for tokens.
export default apiClient;