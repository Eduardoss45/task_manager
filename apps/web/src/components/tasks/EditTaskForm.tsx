import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "@/lib/validators/tasks/taskValidators";
import type { TaskPriority, TaskStatus } from "@/lib/validators/tasks/taskValidators";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { useState } from "react";

type AssignedUser = {
  userId: string;
  username: string;
};

type EditTaskFormProps = {
  task: {
    id: string;
    authorId: string;
    assignedUserIds?: AssignedUser[];
    title: string;
    description?: string;
    dueDate?: string;
    priority: any;
    status: any;
  };
  availableUsers?: AssignedUser[];
  onSuccess: () => void;
};

export function EditTaskForm({ task, availableUsers, onSuccess }: EditTaskFormProps) {
  const { updateTask } = useTaskManager();

  const filteredUsers = availableUsers?.filter(user => user.userId !== task.authorId);

  const [assigned, setAssigned] = useState<AssignedUser[]>(
    (task.assignedUserIds ?? []).filter(u => u.userId !== task.authorId)
  );

  const form = useForm({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedUserIds: assigned,
    },
  });

  function toggleUser(user: AssignedUser) {
    setAssigned(prev =>
      prev.some(u => u.userId === user.userId)
        ? prev.filter(u => u.userId !== user.userId)
        : [...prev, user]
    );
  }

  async function onSubmit(data: any) {
    await updateTask(task.id, {
      ...data,
      assignedUserIds: assigned.map(u => ({
        userId: u.userId,
        username: u.username,
      })),
    });

    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register("title")} placeholder="Título" />
      <Textarea {...form.register("description")} placeholder="Descrição" />
      <Input type="date" {...form.register("dueDate")} />

      <div className="grid grid-cols-2 gap-3">
        <Select
          defaultValue={task.priority}
          onValueChange={(v: TaskPriority) => form.setValue("priority", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={task.status}
          onValueChange={(v: TaskStatus) => form.setValue("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["TODO", "IN_PROGRESS", "REVIEW", "DONE"].map(s => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-zinc-400">Atribuir usuários</p>
        <div className="flex flex-wrap gap-2">
          {filteredUsers?.map((u: any) => (
            <button
              type="button"
              key={u.userId}
              onClick={() => toggleUser(u)}
              className={`px-3 py-1 rounded-full text-xs border transition ${
                assigned.find((a: any) => a.userId === u.userId)
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "border-zinc-700 text-zinc-300"
              }`}
            >
              {u.username}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Salvar alterações
      </Button>
    </form>
  );
}
