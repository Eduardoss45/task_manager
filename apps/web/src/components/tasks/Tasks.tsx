import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { TaskSkeleton } from "../skeletons/TaskSkeleton.tsx";
import { TaskCard } from "./TaskCard.tsx";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

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
    <div className="space-y-3 md:space-y-4 px-2 sm:px-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full md:w-auto">
          <Input
            placeholder="Buscar task"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10"
          />

          <select
            className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-sm text-white"
            onChange={e => setStatus(e.target.value || null)}
          >
            <option value="">Todos</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="REVIEW">REVIEW</option>
            <option value="DONE">DONE</option>
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
            <Link key={task.id} to="/tasks/$taskId" params={{ taskId: task.id }} className="block">
              <TaskCard task={task} />
            </Link>
          ))}
      </div>
    </div>
  );
}
