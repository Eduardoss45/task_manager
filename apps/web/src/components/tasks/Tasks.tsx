import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { TaskSkeleton } from "../skeletons/TaskSkeleton";
import { TaskCard } from "./TaskCard";
import { Link } from "@tanstack/react-router";

export function Tasks() {
  const { tasks, loading, fetchTasks } = useTaskManager();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(2);

  useEffect(() => {
    fetchTasks(page, size);
  }, [fetchTasks, page, size]);

  const filtered = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status ? task.status === status : true;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, status]);

  return (
    <div className="min-h-screen flex flex-col px-2 sm:px-0">
      {/* Conteúdo principal */}
      <div className="flex-1 space-y-4">
        {/* Header + filtros */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full md:w-auto">
            <Input
              placeholder="Buscar task"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10"
            />

            <select
              value={status ?? ""}
              onChange={e => {
                setStatus(e.target.value || null);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="">Todos</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </select>

            <select
              value={size}
              onChange={e => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          <Link to="/tasks/new" className="w-full md:w-auto">
            <Button className="w-full md:w-auto">Nova Task</Button>
          </Link>
        </div>

        {loading && <TaskSkeleton />}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {!loading &&
            filtered.map(task => (
              <Link
                key={task.id}
                to="/tasks/$taskId"
                params={{ taskId: task.id }}
                className="block"
              >
                <TaskCard task={task} />
              </Link>
            ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground pt-8">Nenhuma task encontrada</p>
        )}
      </div>

      {/* Footer / Paginação */}
      <footer className="border-t border-border mt-auto pt-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">Página {page}</span>

          <Button
            variant="outline"
            size="sm"
            disabled={tasks.length < size || loading}
            onClick={() => setPage(p => p + 1)}
          >
            Próxima
          </Button>
        </div>
      </footer>
    </div>
  );
}
