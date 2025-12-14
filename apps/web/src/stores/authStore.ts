import { create } from "zustand";
import { authService } from "@/services/authService";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
};

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const { data } = await authService.me();
      set({ user: data, hydrated: true });
    } catch {
      set({ user: null, hydrated: true });
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
}));
