import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { TaskSkeleton } from "./TaskSkeleton.tsx";
import { TaskCard } from "./TaskCard.tsx";
import { Link } from "@tanstack/react-router";

export function Tasks() {
  const { tasks, loading, fetchTasks } = useTaskManager();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks(1, 10);
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status ? t.status === status : true;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, status]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input placeholder="Buscar task" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="border rounded px-2" onChange={e => setStatus(e.target.value || null)}>
          <option value="">Todos</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="REVIEW">REVIEW</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      {loading && <TaskSkeleton />}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!loading &&
          filtered.map(task => (
            <Link
              key={task.id}
              to="/tasks/$taskId"
              params={{ taskId: task.id }}
              className="inline-block focus:outline-none focus:ring-2 focus:ring-zinc-700 rounded-xl"
            >
              <TaskCard task={task} />
            </Link>
          ))}
      </div>
    </div>
  );
}
