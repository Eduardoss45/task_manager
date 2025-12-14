import { api } from "@/lib/http/api";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post("api/auth/login", data).then(res => res.data),

  register: (data: { email: string; username: string; password: string }) =>
    api.post("api/auth/register", data).then(res => res.data),

  refresh: () => api.post("api/auth/refresh").then(res => res.data),
};
