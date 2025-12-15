import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, MessageSquare, History } from "lucide-react";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import type { TaskDetails } from "@/types/task-details";
import { formatDate } from "@/lib/formatters/date";

type TaskDetailsPageProps = {
  taskId: string;
};

const statusColor: Record<string, string> = {
  TODO: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  REVIEW: "bg-yellow-500",
  DONE: "bg-green-500",
};

const priorityColor: Record<string, string> = {
  LOW: "bg-green-600",
  MEDIUM: "bg-yellow-600",
  HIGH: "bg-red-600",
  URGENT: "bg-red-700",
};

export default function TaskDetailsPage({ taskId }: TaskDetailsPageProps) {
  const { getTask } = useTaskManager();

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getTask(taskId);
        if (active) setTask(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [taskId, getTask]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!task) {
    return <p className="text-zinc-400">Task não encontrada</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-2 rounded-full inline-flex items-center justify-center hover:bg-zinc-800 transition">
        <Link to="/tasks" className="flex items-center justify-center w-10 h-10">
          <ArrowLeft className="text-white w-5 h-5" />
        </Link>
      </div>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl text-zinc-100">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Badge className={`${statusColor[task.status]} text-white`}>{task.status}</Badge>
              <Badge className={`${priorityColor[task.priority]} text-white`}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {task.description && <p className="text-sm text-zinc-300">{task.description}</p>}

          <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" /> Criado por {task.authorName}
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Vencimento: {formatDate(task.dueDate)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Atribuídos:</span>
            <div className="flex -space-x-2">
              {task.assignedUserIds?.length ? (
                task.assignedUserIds.map(u => (
                  <Avatar key={u.userId} className="border border-zinc-900">
                    <AvatarFallback className="bg-zinc-700 text-zinc-100 text-xs">
                      {u.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Nenhum</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {task.comments && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <MessageSquare className="w-5 h-5" /> Comentários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.comments.map(c => (
              <div key={c.id} className="space-y-1">
                <p className="text-sm text-zinc-200">{c.content}</p>
                <span className="text-xs text-zinc-500">
                  {c.authorName} • {formatDate(c.createdAt)}
                </span>
                <Separator className="bg-zinc-800" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {task.audit && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <History className="w-5 h-5" /> Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {task.audit.map(a => (
              <div key={a.id} className="text-sm text-zinc-300">
                <span className="font-medium">{a.actorName}</span> • {a.action}
                <div className="text-xs text-zinc-500">{formatDate(a.createdAt)}</div>
                <Separator className="bg-zinc-800 mt-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
