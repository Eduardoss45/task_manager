import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export const http = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

http.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await http.post("/auth/refresh");
        return http(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);
