import { create } from "zustand";
import { useAuthApi } from "@/hooks/useAuthApi";

export type User = {
  id: string;
  email: string;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => {
  const api = useAuthApi();

  return {
    user: null,
    accessToken: null,
    loading: false,
    error: null,

    login: async (email, password) => {
      set({ loading: true, error: null });
      try {
        const res = await api.login({ email, password });
        set({
          user: res.user,
          accessToken: res.accessToken,
          loading: false,
        });
      } catch (e: any) {
        set({ error: e.message, loading: false });
        throw e;
      }
    },

    register: async (email, username, password) => {
      set({ loading: true, error: null });
      try {
        const res = await api.register({ email, username, password });
        set({ 
          user: res.user,
          accessToken: res.accessToken,
          loading: false,
        });
        console.log(res);
      } catch (e: any) {
        set({ error: e.message, loading: false });
        throw e;
      }
    },

    logout: () => set({ user: null, accessToken: null }),
  };
});
