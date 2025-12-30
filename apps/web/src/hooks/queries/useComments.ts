import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/resources/queries/queryKeys';

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export function useComments(taskId: string, page: number, size: number) {
  return useQuery({
    queryKey: queryKeys.comments(taskId, page),
    queryFn: async (): Promise<Comment[]> => {
      const res = await api.get(`/api/tasks/${taskId}/comments?page=${page}&size=${size}`);
      return res.data;
    },

    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
