import { toast } from "sonner";
import {
  PlusCircle,
  RefreshCcw,
  UserPlus,
  UserMinus,
  Users,
  Pencil,
  MessageSquare,
  Bell,
} from "lucide-react";

import { diffAssignedUsers } from "@/lib/utils/notificationDiff";
import type { TaskUpdatedPayload } from "@/types/notifications";

type FormatterArgs = {
  type: string;
  payload: any;
  currentUserId?: string;
};

function ToastContent({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 mt-0.5 text-zinc-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

export function formatAndNotify({ type, payload, currentUserId }: FormatterArgs) {
  switch (type) {
    case "task:created": {
      toast.info(
        <ToastContent
          icon={PlusCircle}
          text={`${payload.actorName} criou a task "${payload.task.title}"`}
        />
      );
      return;
    }

    case "task:updated": {
      const { actorName, task, before, after, actorId } = payload as TaskUpdatedPayload;

      if (actorId === currentUserId) return;

      if (before.status && after.status && before.status !== after.status) {
        toast.info(
          <ToastContent
            icon={RefreshCcw}
            text={`${actorName} alterou o status da task "${task.title}" (${before.status} → ${after.status})`}
          />
        );
        return;
      }

      const { added, removed } = diffAssignedUsers(before.assignedUserIds, after.assignedUserIds);

      if (added.some(u => u.userId === currentUserId)) {
        toast.success(
          <ToastContent icon={UserPlus} text={`${actorName} te atribuiu à task "${task.title}"`} />
        );
        return;
      }

      if (removed.some(u => u.userId === currentUserId)) {
        toast.warning(
          <ToastContent
            icon={UserMinus}
            text={`${actorName} removeu você da task "${task.title}"`}
          />
        );
        return;
      }

      if (added.length || removed.length) {
        toast(
          <ToastContent
            icon={Users}
            text={`${actorName} atualizou os responsáveis da task "${task.title}"`}
          />
        );
        return;
      }

      toast(<ToastContent icon={Pencil} text={`${actorName} atualizou a task "${task.title}"`} />);
      return;
    }

    case "comment:new": {
      toast(
        <ToastContent
          icon={MessageSquare}
          text={`Novo comentário de ${payload.actorName} na task "${payload.task.title}"`}
        />
      );
      return;
    }

    default:
      toast(<ToastContent icon={Bell} text="Nova notificação" />);
  }
}
