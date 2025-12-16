import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/lib/validators/tasks/commentValidators";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { Send } from "lucide-react";

export function AddCommentForm({ taskId, onSuccess }: any) {
  const { addComment } = useTaskManager();

  const form = useForm({ resolver: zodResolver(commentSchema) });

  async function onSubmit(data: any) {
    await addComment(taskId, data.content);
    form.reset();
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        {...form.register("content")}
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
