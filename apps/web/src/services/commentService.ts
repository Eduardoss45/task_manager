import { http } from "./http";

export const commentService = {
  list: (taskId: string) => http.get(`/tasks/${taskId}/comments`),

  create: (taskId: string, content: string) => http.post(`/tasks/${taskId}/comments`, { content }),
};
