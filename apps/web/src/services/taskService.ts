import { http } from "./http";

export const taskService = {
  list: (params?: { page?: number; size?: number }) => http.get("/tasks", { params }),

  get: (id: string) => http.get(`/tasks/${id}`),

  create: (data: any) => http.post("/tasks", data),

  update: (id: string, data: any) => http.put(`/tasks/${id}`, data),

  remove: (id: string) => http.delete(`/tasks/${id}`),
};
