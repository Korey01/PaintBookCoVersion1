import { useRealtime } from "@/contexts/RealtimeContext";

export function useNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useRealtime();
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll: markAllAsRead,
  };
}

export function useNotificationPreferences() {
  return { setPreferences: (_prefs: Record<string, boolean>) => {} };
}
