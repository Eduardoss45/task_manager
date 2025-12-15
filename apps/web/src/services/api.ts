import axios from "axios";
import { authStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    const { clearUser } = authStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("api/auth/refresh");
        return api(originalRequest);
      } catch {
        clearUser();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);
