import axios from "axios";

const axiosClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 30 seconds timeout
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth-related data on 401 (unauthorized)
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("edulearn_user");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
