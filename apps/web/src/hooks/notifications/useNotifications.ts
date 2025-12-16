import { useEffect } from "react";
import { connectNotifications, disconnectNotifications } from "@/services/notifications.socket";
import { toast } from "sonner";
import { authStore } from "@/store/auth.store";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";

export function useNotifications() {
  const user = authStore(state => state.user);
  const { invalidateAllTasks, invalidateTask } = useTaskManager();

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectNotifications(user.id);

    socket.on("connect", () => {
      console.log("🔔 Notifications connected");
    });

    socket.on("notification", ({ type, payload }) => {
      handleNotification(type, payload);

      if (type.startsWith("task")) {
        if (payload?.task?.id) {
          invalidateTask(payload.task.id);
        } else {
          invalidateAllTasks();
        }
      }

      if (type === "comment:new" && payload?.task?.id) {
        invalidateTask(payload.task.id);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔕 Notifications disconnected");
    });

    return () => {
      socket.off("notification");
      disconnectNotifications();
    };
  }, [user?.id]);
}

function handleNotification(type: string, payload: any) {
  switch (type) {
    case "task:created":
      toast.info(`Você foi atribuído à task "${payload.task.title}"`);
      break;

    case "task:updated":
      toast(`Task atualizada`);
      break;

    case "comment:new":
      toast(`Novo comentário em uma task`);
      break;

    default:
      toast("Nova notificação");
  }
}
