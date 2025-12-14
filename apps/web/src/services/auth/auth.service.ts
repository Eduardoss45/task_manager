import { authApi } from "./auth.api";
import { useAuthStore } from "@/stores/auth.store";

export const authService = {
  async login(email: string, password: string) {
    const res = await authApi.login({ email, password });

    useAuthStore.setState({
      user: res.user,
      accessToken: res.accessToken,
    });
  },

  async register(email: string, username: string, password: string) {
    const res = await authApi.register({ email, username, password });

    useAuthStore.setState({
      user: res.user,
      accessToken: res.accessToken,
    });
  },

  async refreshSession() {
    try {
      const res = await authApi.refresh();

      useAuthStore.setState({
        user: res.user,
        accessToken: res.accessToken,
      });
    } catch {
      useAuthStore.getState().logout();
    }
  },

  logout() {
    useAuthStore.getState().logout();
  },
};
