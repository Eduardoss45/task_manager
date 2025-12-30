import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/resources/queries/queryKeys';
import type { TaskDetails } from '@/types/task-details';

export function useTask(taskId: string) {
  return useQuery<TaskDetails>({
    queryKey: queryKeys.task(taskId),
    queryFn: async () => {
      const res = await api.get(`/api/tasks/${taskId}`);
      return res.data;
    },

    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
