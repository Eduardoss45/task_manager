import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/lib/queries/queryKeys';

type UpdateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  status: string;
  assignedUserIds: {
    userId: string;
    username: string;
  }[];
};

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTaskInput) => {
      const res = await api.put(`/api/tasks/${taskId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.task(taskId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks(),
      });
    },
  });
}
