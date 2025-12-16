import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ShimmerSkeleton } from "@/components/skeletons/ShimmerSkeleton";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { formatDate } from "@/lib/formatters/date";

export function CommentsList({ taskId }: { taskId: string }) {
  const { getComments } = useTaskManager();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getComments(taskId);
    setComments(data.items ?? data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [taskId]);

  if (loading) {
    return <ShimmerSkeleton className="h-24 w-full" />;
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id}>
          <p className="text-sm text-zinc-200">{c.content}</p>
          <span className="text-xs text-zinc-500">
            {c.authorName} • {formatDate(c.createdAt)}
          </span>
          <Separator className="bg-zinc-800 mt-2" />
        </div>
      ))}
    </div>
  );
}
