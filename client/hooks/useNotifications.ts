export function useNotifications() {
  return {
    notifications: [] as { type: string; title: string; body: string; data?: any; timestamp?: Date }[],
    unreadCount: 0,
    markAsRead: (_id: string) => {},
    clearAll: () => {},
  };
}

export function useNotificationPreferences() {
  return { setPreferences: (_prefs: Record<string, boolean>) => {} };
}
