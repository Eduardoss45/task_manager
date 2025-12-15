import { api } from "@/services/api";
import { authStore } from "@/store/auth.store";
import { toast } from "sonner";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function useUserConnect() {
  const navigate = useNavigate();
  const router = useRouter();
  const { user, setUser, clearUser, hydrated, setHydrated } = authStore();
  const [loading, setLoading] = useState(false);

  async function bootstrapSession() {
    try {
      const res = await api.post("api/auth/refresh");
      setUser(res.data.user);
    } catch {
      clearUser();
    } finally {
      setHydrated();
    }
  }

  async function login(data: { email: string; password: string }) {
    setLoading(true);
    try {
      const res = await api.post("api/auth/login", data);
      setUser(res.data.user);
      toast.success("Login realizado com sucesso");
      navigate({ to: "/tasks" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function register(data: {
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
  }) {
    setLoading(true);

    try {
      const { confirmPassword, ...payload } = data;

      const res = await api.post("api/auth/register", payload);

      setUser(res.data.user);
      toast.success("Conta criada com sucesso");
      navigate({ to: "/tasks" });
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearUser();
      navigate({ to: "/" });
      toast.info("Sessão encerrada");
    }
  }

  useEffect(() => {
    api;
    if (!hydrated) return;

    const pathname = router.state.location.pathname;

    if (pathname.startsWith("/tasks") && !user) {
      toast.warning("Faça login para continuar");
      navigate({ to: "/" });
    }
  }, [hydrated, user]);

  return {
    user,
    loading,
    hydrated,
    login,
    register,
    logout,
    bootstrapSession,
    isAuthenticated: !!user,
  };
}
