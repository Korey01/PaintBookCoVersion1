import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  const [isConnected, setIsConnected] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState<
    Set<string>
  >(new Set());

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
    if (!user || role !== "painter") return;

    const subscriptionKey = "job_matches";
    if (activeSubscriptions.has(subscriptionKey)) return;

    const subscription = supabase
      .channel(`job-matches-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_matches",
          filter: `painter_id=eq.${user.id}`,
        },
        (payload: any) => {
          // Fetch the job details to create a richer notification
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

    setActiveSubscriptions((prev) => new Set([...prev, subscriptionKey]));
  }, [user, role, addNotification, activeSubscriptions]);

  // ── Subscribe to job updates ─────────────────────────────────────────────

  const subscribeToJobUpdates = useCallback(
    (jobId: string) => {
      if (!user) return;

      const subscriptionKey = `job-${jobId}`;
      if (activeSubscriptions.has(subscriptionKey)) return;

      const subscription = supabase
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

      setActiveSubscriptions((prev) => new Set([...prev, subscriptionKey]));
    },
    [user, addNotification, activeSubscriptions]
  );

  // ── Subscribe to milestone updates ─────────────────────────────────────────

  const subscribeToMilestoneUpdates = useCallback(
    (jobId: string) => {
      if (!user) return;

      const subscriptionKey = `milestone-${jobId}`;
      if (activeSubscriptions.has(subscriptionKey)) return;

      const subscription = supabase
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

      setActiveSubscriptions((prev) => new Set([...prev, subscriptionKey]));
    },
    [user, addNotification, activeSubscriptions]
  );

  // ── Subscribe to reviews ──────────────────────────────────────────────────

  const subscribeToReviews = useCallback(() => {
    if (!user) return;

    const subscriptionKey = "reviews";
    if (activeSubscriptions.has(subscriptionKey)) return;

    const subscription = supabase
      .channel(`reviews-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `painter_id=eq.${user.id}`,
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

    setActiveSubscriptions((prev) => new Set([...prev, subscriptionKey]));
  }, [user, addNotification, activeSubscriptions]);

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
        setActiveSubscriptions(new Set());
      }
    });
  }, []);

  // ── Auto-subscribe when user logs in or role changes ──────────────────────

  useEffect(() => {
    if (!user) return;

    // All users get review notifications
    subscribeToReviews();

    // Painters get job match notifications
    if (role === "painter") {
      subscribeToJobMatches();
    }

    // Cleanup function
    return () => {
      // Don't unsubscribe on dependency change; keep subscriptions active
      // Only unsubscribe when user logs out
    };
  }, [user, role, subscribeToReviews, subscribeToJobMatches]);

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
