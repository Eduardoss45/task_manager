import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShimmerSkeleton } from "@/components/skeletons/ShimmerSkeleton";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { formatDate } from "@/lib/formatters/date";

export function CommentsList({ taskId }: { taskId: string }) {
  const { getComments } = useTaskManager();

  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size] = useState(5);

  async function load() {
    setLoading(true);
    const data = await getComments(taskId, page, size);
    setComments(data.items ?? data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [taskId, page]);

  if (loading) {
    return <ShimmerSkeleton className="h-24 w-full" />;
  }

  return (
    <div className="min-h-[120px] flex flex-col">
      <div className="flex-1 space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500 text-center">Nenhum comentário ainda</p>
        )}

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

      <div className="flex items-center justify-between pt-3 mt-auto">
        <Button
          variant="secondary"
          size="sm"
          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          disabled={page === 1 || loading}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Anterior
        </Button>

        <span className="text-xs text-muted-foreground">Página {page}</span>

        <Button
          variant="secondary"
          size="sm"
          className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          disabled={comments.length < size}
          onClick={() => setPage(p => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
