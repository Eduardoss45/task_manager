import { authService } from "@/services/auth/auth.service";
import { useAuthStore } from "@/stores/auth.store";

export const useAuth = () => {
  const store = useAuthStore();

  return {
    ...store,
    login: authService.login,
    register: authService.register,
    logout: authService.logout,
  };
};
