import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function CreateTaskPage() {
  const { createTask, invalidateAllTasks, fetchTasks } = useTaskManager();
  const navigate = useNavigate();

  async function handleCreate(data: any) {
    const created = await createTask(data);

    if (!created) return;

    invalidateAllTasks();
    await fetchTasks(1, 10);

    navigate({
      to: "/tasks/$taskId",
      params: { taskId: created.id },
    });
  }

  return (
    <>
      <div className="bg-zinc-900 p-2 rounded-full inline-flex hover:bg-zinc-800 transition">
        <Link to="/tasks" className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
      </div>
      <div className="flex justify-center px-4 py-10">
        <Card className="w-full max-w-xl bg-zinc-900 border-zinc-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-zinc-100">Nova Task</CardTitle>

            <CardDescription className="text-zinc-400">
              Crie uma nova atividade para acompanhar o progresso do time.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CreateTaskForm onSubmit={handleCreate} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
