import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  email: string;
  username: string;
};

type AuthState = {
  user: User | null;
  hydrated: boolean;

  setUser: (user: User) => void;
  clearUser: () => void;
  setHydrated: () => void;
};

export const authStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      hydrated: false,

      setUser: user => set({ user }),
      clearUser: () => set({ user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "auth-storage",
      partialize: state => ({ user: state.user }),
    }
  )
);
