import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShimmerSkeleton } from '@/components/skeletons/ShimmerSkeleton';
import { formatDate } from '@/lib/formatters/date';
import { useComments } from '@/hooks/queries/useComments';

export function CommentsList({ taskId }: { taskId: string }) {
  const [page, setPage] = useState(1);
  const size = 5;

  const { data, isPending } = useComments(taskId, page, size);

  if (isPending) {
    return <ShimmerSkeleton className="h-24 w-full" />;
  }

  const comments = data ?? [];

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
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Anterior
        </Button>

        <span className="text-xs text-muted-foreground">Página {page}</span>

        <Button
          variant="secondary"
          size="sm"
          disabled={comments.length < size}
          onClick={() => setPage(p => p + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
