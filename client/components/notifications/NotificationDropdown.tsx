import { format } from "date-fns";
import { X, AlertCircle, CheckCircle, MessageCircle, Star, Bell } from "lucide-react";
import { Notification } from "@/contexts/RealtimeContext";

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick: (id: string) => void;
  onClear: (id: string) => void;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onNotificationClick,
  onClear,
  onClose,
}: NotificationDropdownProps) {
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "job_match":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "job_update":
        return <CheckCircle className="h-4 w-4 text-amber-500" />;
      case "milestone_update":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "review":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "message":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return format(date, "MMM d");
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Close notifications"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-border">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
              !notification.read ? "bg-muted/30" : ""
            }`}
            onClick={() => onNotificationClick(notification.id)}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      !notification.read
                        ? "text-foreground font-semibold"
                        : "text-foreground/80"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear(notification.id);
                    }}
                    className="flex-shrink-0 p-1 hover:bg-background rounded transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>

                <p className="text-xs text-muted-foreground/60 mt-2">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border p-3 bg-muted/30 text-center">
          <button
            onClick={() => {
              // Could navigate to notification center page if desired
              onClose();
            }}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
