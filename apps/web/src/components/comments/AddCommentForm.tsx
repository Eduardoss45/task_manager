import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/resources/queries/queryKeys';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema } from '@/resources/validators/tasks/commentValidators';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTaskManager } from '@/hooks/tasks/useTaskManager';
import { Send } from 'lucide-react';

type AddCommentFormProps = {
  taskId: string;
  onSuccess?: () => void;
};

export function AddCommentForm({ taskId }: AddCommentFormProps) {
  const { addComment } = useTaskManager();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(commentSchema),
  });

  async function onSubmit(data: any) {
    await addComment(taskId, data.content);

    form.reset();

    queryClient.invalidateQueries({
      queryKey: ['comments', taskId],
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.task(taskId),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...form.register('content')}
        placeholder="Escreva um comentário..."
        className="resize-none"
      />
      <div className="flex justify-end">
        <Button size="sm" className="gap-2">
          <Send className="w-4 h-4" />
          Comentar
        </Button>
      </div>
    </form>
  );
}
