import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.mintcoins.pro",
  headers: { "Content-Type": "application/json" },
});

// Intercept expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = JSON.parse(localStorage.getItem("bitexly_tokens") || "{}");
      if (!tokens?.refresh) return Promise.reject(error);

      try {
        const res = await axios.post(
          `${apiClient.defaults.baseURL}/users/token/refresh/`,
          { refresh: tokens.refresh }
        );
        const newAccess = res.data.access;
        tokens.access = newAccess;
        localStorage.setItem("bitexly_tokens", JSON.stringify(tokens));
        apiClient.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      } catch (err) {
        localStorage.removeItem("bitexly_user");
        localStorage.removeItem("bitexly_tokens");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;