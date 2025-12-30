import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/resources/queries/queryKeys';

type AssignedUser = {
  userId: string;
  username: string;
};

export function useUsers() {
  return useQuery<AssignedUser[]>({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const res = await api.get('api/auth/users');

      return res.data.availableUsers ?? [];
    },
    staleTime: 15 * 60 * 1000,
  });
}
