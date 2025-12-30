import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/resources/queries/queryKeys';

export function useTasks(page: number, size: number) {
  return useQuery({
    queryKey: queryKeys.tasks({ page, size }),
    queryFn: async () => {
      const res = await api.get(`api/tasks?page=${page}&size=${size}`);
      return res.data.items ?? res.data;
    },
    placeholderData: previousData => previousData,
  });
}
