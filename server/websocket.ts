import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getPrismaClient } from "./lib/db";
import { verifyToken } from "./lib/auth";

const prisma = getPrismaClient();

/**
 * Initialize Socket.io for real-time notifications
 * Handles painter notifications for new jobs, quote updates, etc.
 */
export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:8080", "http://localhost:3000"],
      methods: ["GET", "POST"],
    },
  });

  // Middleware for socket authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("No authentication token provided"));
      }

      const payload = verifyToken(token);
      if (!payload) {
        return next(new Error("Invalid token"));
      }

      socket.data.userId = payload.id;
      socket.data.userEmail = payload.email;
      socket.data.userType = payload.userType;

      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.data.userId} (${socket.data.userEmail})`);

    // Join user to their personal room
    socket.join(`user:${socket.data.userId}`);

    // For painters, join painter room for job notifications
    if (socket.data.userType === "painter") {
      socket.join("painters");
      socket.emit("notification", {
        type: "connected",
        message: "You are now receiving real-time notifications",
      });
    }

    /**
     * Listen for notification preferences
     * Painters can set their notification preferences
     */
    socket.on("set-notification-preference", (preferences: any) => {
      console.log(`Notification preferences set for ${socket.data.userId}:`, preferences);
      socket.emit("notification-preference-saved", { success: true });
    });

    /**
     * Listen for marking notification as read
     * Reduces notification count
     */
    socket.on("mark-notification-read", async (notificationId: string) => {
      try {
        // In production, update notification read status in database
        socket.emit("notification-marked-read", { success: true });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        socket.emit("error", { message: "Failed to mark notification as read" });
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });

    // Error handler
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.data.userId}:`, error);
    });
  });

  // Store io instance for broadcasting
  (global as any).io = io;

  return io;
}

/**
 * Broadcast notification to a specific painter
 * Called from job creation and quote updates
 */
export async function notifyPainter(
  userId: string,
  notification: {
    type: string;
    title: string;
    body: string;
    data?: any;
  }
) {
  const io = (global as any).io;
  if (!io) return;

  io.to(`user:${userId}`).emit("notification", notification);
}

/**
 * Broadcast notification to all painters in a location
 * Called when a new job is posted
 */
export async function notifyPaintersInLocation(
  postcode: string,
  notification: {
    type: string;
    title: string;
    body: string;
    jobId: string;
    data?: any;
  }
) {
  const io = (global as any).io;
  if (!io) return;

  // Find all painters in this location
  const painters = await prisma.painterProfile.findMany({
    where: {
      postcode,
      verificationStatus: "approved",
    },
    select: {
      userId: true,
    },
  });

  // Notify each painter
  for (const painter of painters) {
    io.to(`user:${painter.userId}`).emit("notification", notification);
  }
}

/**
 * Broadcast job status update to customer and painter
 */
export async function notifyJobUpdate(
  jobId: string,
  userId: string,
  notification: {
    type: string;
    title: string;
    body: string;
    data?: any;
  }
) {
  const io = (global as any).io;
  if (!io) return;

  io.to(`user:${userId}`).emit("notification", notification);
}

/**
 * Broadcast to all admins
 */
export async function notifyAdmins(notification: {
  type: string;
  title: string;
  body: string;
  data?: any;
}) {
  const io = (global as any).io;
  if (!io) return;

  const adminEmails = [
    "admin@paintbookco.com",
    "support@paintbookco.com",
    "oluwakorede@paintbookco.com",
  ];

  const admins = await prisma.user.findMany({
    where: {
      email: {
        in: adminEmails,
      },
    },
    select: {
      id: true,
    },
  });

  for (const admin of admins) {
    io.to(`user:${admin.id}`).emit("notification", notification);
  }
}
