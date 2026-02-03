import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware } from "@server/middleware/auth";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

// Valid notification types from Prisma schema
const VALID_NOTIFICATION_TYPES = [
  "job_posted",
  "quote_requested",
  "quote_received",
  "quote_accepted",
  "payment_received",
  "job_complete",
  "job_approved",
  "dispute_raised",
  "message_received",
];

/**
 * GET /api/notifications
 * Get all notifications for authenticated user
 */
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, pageSize = 20, type } = req.query;
      const pageNum = Math.max(1, Number(page));
      const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)));

      const where: any = {
        userId: req.userId,
      };

      // Only filter by type if it's a valid notification type
      if (type && VALID_NOTIFICATION_TYPES.includes(String(type))) {
        where.type = String(type);
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (pageNum - 1) * pageSizeNum,
          take: pageSizeNum,
        }),
        prisma.notification.count({ where }),
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          notifications,
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/notifications/unread
 * Get count of unread notifications
 */
router.get(
  "/unread",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.userId,
          // Add 'read' flag to notification model in future
          // For now, all notifications are unread
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          unreadCount,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete(
  "/:notificationId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { notificationId } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          error: "Notification not found",
        });
        return;
      }

      if (notification.userId !== req.userId) {
        res.status(403).json({
          success: false,
          error: "Not authorized to delete this notification",
        });
        return;
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: "Notification deleted",
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/notifications/notify-painters
 * Internal endpoint to notify painters of new job (called by job creation)
 * In production, this should be called asynchronously via queue
 */
router.post(
  "/notify-painters",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId, jobTitle, postcode, jobType } = req.body;

      if (!jobId || !jobTitle || !postcode) {
        res.status(400).json({
          success: false,
          error: "jobId, jobTitle, and postcode are required",
        });
        return;
      }

      // Find painters in the area with matching skills
      const painters = await prisma.painterProfile.findMany({
        where: {
          // Painter is verified
          verificationStatus: "approved",
          // Painter has service area (postcode match is simplified here)
          postcode,
        },
        select: {
          userId: true,
          skills: true,
        },
      });

      // Create notifications for each painter
      const notifications = [];
      for (const painter of painters) {
        // Check if painter has the relevant skills
        // For interior/exterior, we'll notify all verified painters in area
        // In production, do more sophisticated matching

        const notification = await prisma.notification.create({
          data: {
            userId: painter.userId,
            jobId,
            type: "job_available",
            title: "New Job Available",
            body: `A new ${jobType} painting job is available near you: "${jobTitle}"`,
          },
        });

        notifications.push(notification);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          notificationsSent: notifications.length,
          message: `Notified ${notifications.length} painters of new job`,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Notify painters error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/notifications/clear-all
 * Clear all notifications for user (use cautiously)
 */
router.post(
  "/clear-all",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          userId: req.userId,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          deletedCount: result.count,
          message: `Deleted ${result.count} notifications`,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Clear notifications error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

export default router;
