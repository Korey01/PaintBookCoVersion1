import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

// ── Notification Types ────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "job_match" | "job_update" | "milestone_update" | "review" | "message";
  title: string;
  message: string;
  relatedId?: string; // job_id, milestone_id, etc.
  read: boolean;
  createdAt: string;
}

export interface RealtimeUpdate {
  table: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  new?: Record<string, any>;
  old?: Record<string, any>;
}

export interface RealtimeContextType {
  // State
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;

  // Methods
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotification: (notificationId: string) => void;
  subscribeToJobMatches: () => void;
  subscribeToJobUpdates: (jobId: string) => void;
  subscribeToMilestoneUpdates: (jobId: string) => void;
  unsubscribeFromAll: () => void;
}

// ── Context Creation ──────────────────────────────────────────────────────────

const RealtimeContext = createContext<RealtimeContextType | null>(null);

// ── Realtime Provider Component ───────────────────────────────────────────────

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, role } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [painterId, setPainterId] = useState<string | null>(null);
  const activeSubscriptions = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (user && role === "painter") {
      supabase
        .from("painters")
        .select("id")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setPainterId(data.id);
        });
    } else {
      setPainterId(null);
    }
  }, [user, role]);

  // ── Helper: Add or update notification ────────────────────────────────────
  const addNotification = useCallback(
    (notification: Omit<Notification, "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  // ── Subscribe to job matches (for painters) ───────────────────────────────

  const subscribeToJobMatches = useCallback(() => {
    if (!user || role !== "painter" || !painterId) return;

    const subscriptionKey = "job_matches";
    if (activeSubscriptions.current.has(subscriptionKey)) return;

    supabase
      .channel(`job-matches-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_matches",
          filter: `painter_id=eq.${painterId}`,
        },
        (payload: any) => {
          supabase
            .from("jobs")
            .select("*")
            .eq("id", payload.new.job_id)
            .single()
            .then(({ data: job }) => {
              if (job) {
                addNotification({
                  id: `match-${payload.new.id}`,
                  type: "job_match",
                  title: "New Job Match",
                  message: `New job: ${job.title || "Painting Project"}`,
                  relatedId: job.id,
                  read: false,
                });
              }
            });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    activeSubscriptions.current.add(subscriptionKey);
  }, [user, role, painterId, addNotification]);

  // ── Subscribe to job updates ─────────────────────────────────────────────

  const subscribeToJobUpdates = useCallback(
    (jobId: string) => {
      if (!user) return;

      const subscriptionKey = `job-${jobId}`;
      if (activeSubscriptions.current.has(subscriptionKey)) return;

      supabase
        .channel(`job-updates-${jobId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "jobs",
            filter: `id=eq.${jobId}`,
          },
          (payload: any) => {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;

            const statusMessages: Record<string, string> = {
              painter_accepted: "Painter has accepted your job",
              awaiting_payment: "Payment required to proceed",
              escrow_funded: "Payment has been secured in escrow",
              in_progress: "Work has started on your job",
              milestone_review: "A milestone is awaiting your review",
              pending_completion: "Job is nearing completion",
              completed: "Job has been completed",
              disputed: "A dispute has been raised",
              cancelled: "Job has been cancelled",
            };

            if (oldStatus !== newStatus) {
              addNotification({
                id: `job-update-${jobId}-${Date.now()}`,
                type: "job_update",
                title: "Job Status Updated",
                message:
                  statusMessages[newStatus] ||
                  `Job status changed to ${newStatus}`,
                relatedId: jobId,
                read: false,
              });
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });

      activeSubscriptions.current.add(subscriptionKey);
    },
    [user, addNotification]
  );

  // ── Subscribe to milestone updates ─────────────────────────────────────────

  const subscribeToMilestoneUpdates = useCallback(
    (jobId: string) => {
      if (!user) return;

      const subscriptionKey = `milestone-${jobId}`;
      if (activeSubscriptions.current.has(subscriptionKey)) return;

      supabase
        .channel(`milestone-updates-${jobId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "job_milestones",
            filter: `job_id=eq.${jobId}`,
          },
          (payload: any) => {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;

            const milestoneMessages: Record<string, string> = {
              submitted: "Milestone has been submitted for review",
              approved: "Milestone has been approved",
              paid: "Milestone payment has been released",
              disputed: "Milestone is under dispute",
            };

            if (oldStatus !== newStatus) {
              addNotification({
                id: `milestone-${payload.new.id}-${Date.now()}`,
                type: "milestone_update",
                title: "Milestone Status Changed",
                message:
                  milestoneMessages[newStatus] ||
                  `Milestone status changed to ${newStatus}`,
                relatedId: jobId,
                read: false,
              });
            }
          }
        )
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });

      activeSubscriptions.current.add(subscriptionKey);
    },
    [user, addNotification]
  );

  // ── Subscribe to reviews ──────────────────────────────────────────────────

  const subscribeToReviews = useCallback(() => {
    if (!user || !painterId) return;

    const subscriptionKey = "reviews";
    if (activeSubscriptions.current.has(subscriptionKey)) return;

    supabase
      .channel(`reviews-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `painter_id=eq.${painterId}`,
        },
        (payload: any) => {
          addNotification({
            id: `review-${payload.new.id}`,
            type: "review",
            title: "New Review",
            message: `You received a ${payload.new.rating}-star review`,
            relatedId: payload.new.job_id,
            read: false,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    activeSubscriptions.current.add(subscriptionKey);
  }, [user, painterId, addNotification]);

  // ── Mark notification as read ────────────────────────────────────────────

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  // ── Mark all notifications as read ────────────────────────────────────────

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  // ── Clear a notification ─────────────────────────────────────────────────

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // ── Unsubscribe from all channels ────────────────────────────────────────

  const unsubscribeFromAll = useCallback(() => {
    supabase.removeAllChannels().then((status) => {
      if (status === "ok") {
        activeSubscriptions.current.clear();
      }
    });
  }, []);

  // ── Auto-subscribe when user logs in or role changes ──────────────────────

  useEffect(() => {
    if (!user) return;
    if (role === "painter" && !painterId) return;

    subscribeToReviews();

    if (role === "painter") {
      subscribeToJobMatches();
    }

    return () => {
      // Don't unsubscribe on dependency change; keep subscriptions active
    };
  }, [user, role, painterId, subscribeToReviews, subscribeToJobMatches]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      unsubscribeFromAll();
    };
  }, [unsubscribeFromAll]);

  // ── Calculate unread count ──────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: RealtimeContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotification,
    subscribeToJobMatches,
    subscribeToJobUpdates,
    subscribeToMilestoneUpdates,
    unsubscribeFromAll,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

// ── Custom Hook ───────────────────────────────────────────────────────────────

export function useRealtime(): RealtimeContextType {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}
