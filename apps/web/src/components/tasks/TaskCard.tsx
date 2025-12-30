import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import type { Task } from '@/types/task';
import { formatDate } from '@/resources/formatters/date';

const statusColor: Record<string, string> = {
  TODO: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-yellow-500',
  DONE: 'bg-green-500',
};

const priorityColor: Record<string, string> = {
  LOW: 'bg-green-600',
  MEDIUM: 'bg-yellow-600',
  HIGH: 'bg-red-600',
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 min-h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base text-zinc-100">{task.title}</CardTitle>

          <div className="flex gap-2">
            <Badge className={`${statusColor[task.status]} text-white`}>{task.status}</Badge>
            <Badge className={`${priorityColor[task.priority]} text-white`}>{task.priority}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && <p className="text-sm text-zinc-400">{task.description}</p>}

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <User className="w-4 h-4" />
          <span>Criado por {task.authorName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="w-4 h-4" />
          <span>Vencimento: {formatDate(task.dueDate)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Atribuídos:</span>
          <div className="flex -space-x-2">
            {task.assignedUserIds.map(u => (
              <Avatar key={u.userId} className="border border-zinc-900">
                <AvatarFallback className="bg-zinc-700 text-zinc-100 text-xs">
                  {u.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedUserIds.length === 0 && (
              <span className="text-xs text-zinc-500">Nenhum</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
