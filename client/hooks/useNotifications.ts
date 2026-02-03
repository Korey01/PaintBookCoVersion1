import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";

export interface Notification {
  type: string;
  title: string;
  body: string;
  data?: any;
  timestamp?: Date;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (index: number) => void;
  clearNotifications: () => void;
}

/**
 * Custom hook for managing real-time notifications
 * Connects to WebSocket server and manages notification state
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return; // Don't connect if not authenticated
    }

    // Create Socket.io connection
    const newSocket = io("http://localhost:3000", {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection event
    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      setIsConnected(true);
    });

    // Receive notification event
    newSocket.on("notification", (notification: Notification) => {
      const newNotification = {
        ...notification,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if supported
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.body,
          icon: "/logo.png",
        });
      }
    });

    // Disconnection event
    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
      setIsConnected(false);
    });

    // Error event
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(
    (index: number) => {
      if (socket && notifications[index]) {
        socket.emit("mark-notification-read", notifications[index]);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [socket, notifications]
  );

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearNotifications,
  };
}

/**
 * Custom hook for setting notification preferences
 */
export function useNotificationPreferences() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const newSocket = io("http://localhost:3000", {
      auth: { token },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const setPreferences = useCallback(
    (preferences: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      jobNotifications?: boolean;
      quoteNotifications?: boolean;
    }) => {
      if (socket) {
        socket.emit("set-notification-preference", preferences);
      }
    },
    [socket]
  );

  return { setPreferences };
}
