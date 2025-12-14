import { http } from "@/lib/http";

type LoginDto = {
  email: string;
  password: string;
};

type RegisterDto = {
  email: string;
  username: string;
  password: string;
};

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
};

export function useAuthApi() {
  return {
    login: (data: LoginDto) =>
      http<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    register: (data: RegisterDto) =>
      http<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    refresh: () =>
      http<AuthResponse>("/api/auth/refresh", {
        method: "POST",
      }),
  };
}
