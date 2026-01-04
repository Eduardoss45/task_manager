import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editTaskSchema } from '@/resources/validators/tasks/taskValidators';
import type { TaskPriority, TaskStatus } from '@/resources/validators/tasks/taskValidators';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUpdateTask } from '@/hooks/queries/useUpdateTask';
import { useState } from 'react';

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
  onSuccess: (updatedTask: any) => void;
};

export function EditTaskForm({ task, availableUsers, onSuccess }: EditTaskFormProps) {
  const updateTaskMutation = useUpdateTask(task.id);

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

  function onSubmit(data: any) {
    updateTaskMutation
      .mutateAsync({
        ...data,
        assignedUserIds: assigned.map(u => ({
          userId: u.userId,
          username: u.username,
        })),
      })
      .then(updatedTask => {
        toast.success('Tarefa atualizada com sucesso');
        onSuccess(updatedTask);
      })
      .catch((err: any) => {
        // 🔐 Permissão
        if (err?.response?.status === 403 || err?.message === 'TASK_FORBIDDEN') {
          toast.error('Você não tem permissão para editar esta tarefa');
          return;
        }

        toast.error('Erro ao salvar alterações');
      });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register('title')} placeholder="Título" />
      <Textarea {...form.register('description')} placeholder="Descrição" />
      <Controller
        name="dueDate"
        control={form.control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="
            w-full h-10 flex items-center justify-center
            rounded-md
            bg-zinc-950 text-zinc-100
            border border-zinc-800
            text-sm font-medium
            placeholder:text-zinc-400
            focus-visible:ring-2 focus-visible:ring-blue-500
            cursor-pointer
          "
              >
                {field.value ? new Date(field.value).toLocaleDateString() : 'Selecione uma data'}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date: Date | undefined) => date && field.onChange(date.toISOString())}
                disabled={(date: Date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          defaultValue={task.priority}
          onValueChange={(v: TaskPriority) => form.setValue('priority', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={task.status}
          onValueChange={(v: TaskStatus) => form.setValue('status', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(s => (
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
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'border-zinc-700 text-zinc-300'
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
