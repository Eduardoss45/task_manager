import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/commentService";

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => (await commentService.list(taskId)).data,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => commentService.create(taskId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", taskId] }),
  });
}
