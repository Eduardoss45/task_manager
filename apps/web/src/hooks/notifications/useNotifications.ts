import { useEffect } from "react";
import { connectNotifications, disconnectNotifications } from "@/services/notifications.socket";
import { authStore } from "@/store/auth.store";
import { useTaskManager } from "@/hooks/tasks/useTaskManager";
import { formatAndNotify } from "@/lib/formatters/notificationFormatter";

export function useNotifications() {
  const user = authStore(state => state.user);
  const { invalidateAllTasks, invalidateTask } = useTaskManager();

  useEffect(() => {
    if (!user?.id) return;

    const socket = connectNotifications(user.id);

    socket.on("connect", () => {
      console.log("Notifications connected");
    });

    socket.on("notification", ({ type, payload }) => {
      formatAndNotify({
        type,
        payload,
        currentUserId: user.id,
      });

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
      console.log("Notifications disconnected");
    });

    return () => {
      socket.off("notification");
      disconnectNotifications();
    };
  }, [user?.id]);
}
