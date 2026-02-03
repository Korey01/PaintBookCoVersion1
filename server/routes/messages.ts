import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware } from "@server/middleware/auth";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/messages
 * Send a message (for a job)
 */
router.post("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, recipientId, content, attachments }: any = req.body;

    // Validation
    if (!jobId || !recipientId || !content) {
      res.status(400).json({
        success: false,
        error: "jobId, recipientId, and content are required",
      });
      return;
    }

    if (content.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Message content cannot be empty",
      });
      return;
    }

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check authorization - sender must be customer or painter of the job
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to send messages for this job",
      });
      return;
    }

    // Verify recipient is the other party
    if (recipientId === req.userId) {
      res.status(400).json({
        success: false,
        error: "Cannot send message to yourself",
      });
      return;
    }

    if (job.customerId !== recipientId && job.painterId !== recipientId) {
      res.status(403).json({
        success: false,
        error: "Recipient is not part of this job",
      });
      return;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        jobId,
        senderId: req.userId!,
        recipientId,
        content,
        attachments: attachments || [],
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        jobId,
        type: "message_received",
        title: "New Message",
        body: `You have a new message about the job "${job.title}"`,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: formatMessageResponse(message),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/messages/:jobId
 * List messages for a job
 */
router.get("/:jobId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;

    const pageNum = Math.max(1, Number(page));
    const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)));

    // Get job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check authorization - only customer or painter can view messages
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to view messages for this job",
      });
      return;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { jobId },
        include: {
          sender: {
            select: { id: true, email: true, userType: true },
          },
          recipient: {
            select: { id: true, email: true, userType: true },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (pageNum - 1) * pageSizeNum,
        take: pageSizeNum,
      }),
      prisma.message.count({ where: { jobId } }),
    ]);

    // Mark messages as read if user is recipient
    await prisma.message.updateMany({
      where: {
        jobId,
        recipientId: req.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        messages: messages.map(formatMessageResponse),
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("List messages error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/messages/job/:jobId/unread
 * Get unread message count for a job
 */
router.get("/job/:jobId/unread", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check authorization
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to view messages for this job",
      });
      return;
    }

    const unreadCount = await prisma.message.count({
      where: {
        jobId,
        recipientId: req.userId,
        readAt: null,
      },
    });

    const response: ApiResponse = {
      success: true,
      data: { unreadCount },
    };

    res.json(response);
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * PUT /api/messages/:messageId/read
 * Mark message as read
 */
router.put("/:messageId/read", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      res.status(404).json({
        success: false,
        error: "Message not found",
      });
      return;
    }

    // Check authorization - only recipient can mark as read
    if (message.recipientId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to mark this message as read",
      });
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });

    const response: ApiResponse = {
      success: true,
      data: formatMessageResponse(updatedMessage),
    };

    res.json(response);
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Helper function
function formatMessageResponse(message: any): any {
  return {
    id: message.id,
    jobId: message.jobId,
    senderId: message.senderId,
    recipientId: message.recipientId,
    sender: message.sender,
    recipient: message.recipient,
    content: message.content,
    attachments: message.attachments || [],
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString(),
  };
}

export default router;
