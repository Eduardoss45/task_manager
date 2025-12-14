import { create } from "zustand";

export type User = {
  id: string;
  email: string;
  username?: string;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  logout: () => set({ user: null, accessToken: null }),
}));
