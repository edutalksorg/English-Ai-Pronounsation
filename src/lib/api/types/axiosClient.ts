import axios from "axios";

const axiosClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 30 seconds timeout
});

// Attach access token to outgoing requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // ensure headers object exists
      if (!config.headers) config.headers = {} as any;
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token handling: queue requests while a refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (err: any) => void;
  config: any;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      if (!p.config.headers) p.config.headers = {};
      p.config.headers.Authorization = `Bearer ${token}`;
      p.resolve(axiosClient(p.config));
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        // No refresh available, clear storage and reject
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("edulearn_user");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use a bare axios instance to avoid interceptor recursion
        const bare = axios.create({ baseURL: axiosClient.defaults.baseURL });
        const resp = await bare.post('/api/v1/auth/refresh-token', { refreshToken });
        const data = resp?.data ?? resp;
        const newAccess = data?.accessToken ?? data?.access_token ?? data?.token ?? null;
        const newRefresh = data?.refreshToken ?? data?.refresh_token ?? null;

        if (newAccess) {
          localStorage.setItem('access_token', newAccess);
          if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
          processQueue(null, newAccess);
          return axiosClient(originalRequest);
        }

        // Refresh didn't return tokens -> clear and reject
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('edulearn_user');
        processQueue(new Error('Unable to refresh token'), null);
        return Promise.reject(error);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('edulearn_user');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
