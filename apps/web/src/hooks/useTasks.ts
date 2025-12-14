import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";

export function useTasks(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => (await taskService.list(params)).data,
  });
}
