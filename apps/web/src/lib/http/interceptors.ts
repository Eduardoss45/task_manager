import { api } from "./api";
import { refreshQueue } from "./refresh-queue";
import { useAuthStore } from "@/stores/auth.store";

api.interceptors.request.use(config => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (refreshQueue.isRefreshing()) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    refreshQueue.start();

    try {
      const res = await api.post("/auth/refresh");
      const newAccessToken = res.data.accessToken;

      useAuthStore.setState({ accessToken: newAccessToken });

      refreshQueue.resolveAll(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      refreshQueue.rejectAll(err);
      useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      refreshQueue.stop();
    }
  }
);
