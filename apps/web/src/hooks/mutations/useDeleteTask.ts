import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/resources/queries/queryKeys';

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      await api.delete(`/api/tasks/${taskId}`);
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks() });
      queryClient.removeQueries({ queryKey: queryKeys.task(taskId) });
    },
  });
}
