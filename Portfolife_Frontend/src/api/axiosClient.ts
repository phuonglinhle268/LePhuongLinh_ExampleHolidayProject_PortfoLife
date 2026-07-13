import axios from 'axios';
import { store } from '../store';
import { logout, updateAccessToken } from '../store/slices/authSlice';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080', // Backend Base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Auto Refresh Token
axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data (ApiResponse) trực tiếp để giảm bớt đóng gói
  },
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra lỗi 401 và tránh tự động làm mới token cho các request auth
    const isAuthUrl = originalRequest.url?.includes('/api/v1/auth/');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      try {
        // Dùng axios thô để tránh lặp interceptor
        const refreshResponse = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data.data.accessToken;
        store.dispatch(updateAccessToken(newAccessToken));

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    // Chuẩn hóa thông báo lỗi trả về
    const message = error.response?.data?.message || 'Có lỗi hệ thống xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
