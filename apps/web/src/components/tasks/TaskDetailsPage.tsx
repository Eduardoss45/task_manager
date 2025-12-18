import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, MessageSquare, History } from "lucide-react";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import type { TaskDetails } from "@/types/task-details";
import { formatDate } from "@/lib/formatters/date";
import { EditTaskForm } from "@/components/tasks/EditTaskForm";
import { AddCommentForm } from "@/components/comments/AddCommentForm";
import { CommentsList } from "@/components/comments/CommentsList";

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
  const { getTask, deleteTask, getUsers } = useTaskManager();
  const navigate = useNavigate();

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{ userId: string; username: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [commentsVersion, setCommentsVersion] = useState(0);

  const loadTask = useCallback(async () => {
    setLoading(true);
    const data = await getTask(taskId);
    setTask(data);
    setLoading(false);
  }, [taskId, getTask]);

  const loadUsers = useCallback(async () => {
    const users = await getUsers();
    setAvailableUsers(users);
  }, [getUsers]);

  useEffect(() => {
    loadTask();
    loadUsers();
  }, [loadTask, loadUsers]);

  const refetchComments = () => {
    setCommentsVersion(v => v + 1);
  };

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
    <div className="gap-6 p-6 w-full min-h-screen">
      <div className="space-y-6">
        <div className="bg-zinc-900 p-2 rounded-full inline-flex hover:bg-zinc-800 transition">
          <Link to="/tasks" className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex justify-between">
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

            <div className="flex gap-6 text-sm text-zinc-400">
              <div className="flex gap-2 items-center">
                <User className="w-4 h-4" />
                Criado por {task.authorName}
              </div>

              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4" />
                {formatDate(task.dueDate)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-white">
              <span className="text-sm text-zinc-400">Atribuídos:</span>
              <div className="flex -space-x-2">
                {task.assignedUserIds?.length ? (
                  task.assignedUserIds.map(u => (
                    <Avatar key={u.userId}>
                      <AvatarFallback className="bg-zinc-700 text-xs">
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

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              const ok = await deleteTask(task.id);
              if (ok) {
                navigate({ to: "/tasks" });
              }
            }}
          >
            Deletar
          </Button>
        </div>

        {editing && (
          <EditTaskForm
            task={task}
            availableUsers={availableUsers}
            onSuccess={updatedTask => {
              setTask(updatedTask);
              setEditing(false);
            }}
          />
        )}

        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comentários
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <AddCommentForm taskId={task.id} onSuccess={refetchComments} />

            <CommentsList key={commentsVersion} taskId={task.id} />
          </CardContent>
        </Card>

        {task.audit && (
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {task.audit.map(a => (
                <div key={a.id}>
                  <p className="text-sm">
                    <strong>{a.actorName}</strong> • {a.action}
                  </p>
                  <span className="text-xs text-zinc-500">{formatDate(a.createdAt)}</span>
                  <Separator className="mt-2 bg-zinc-800" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>{" "}
    </div>
  );
}
