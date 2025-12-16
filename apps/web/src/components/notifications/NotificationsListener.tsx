import { useNotifications } from "@/hooks/notifications/useNotifications";

export function NotificationsListener() {
  useNotifications();
  return null;
}
