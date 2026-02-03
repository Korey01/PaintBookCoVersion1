import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requireAuth } from "@server/middleware/auth";
import { requireAdmin } from "@server/middleware/admin";
import type {
  CreateDisputeRequest,
  DisputeResponse,
  ApiResponse,
} from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/disputes
 * Create a new dispute (customer or painter)
 */
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId, reason, description, evidence }: CreateDisputeRequest =
        req.body;

      // Validation
      if (!jobId || !reason) {
        res.status(400).json({
          success: false,
          error: "jobId and reason are required",
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

      // Check authorization - only customer or assigned painter can create dispute
      if (job.customerId !== req.userId && job.painterId !== req.userId) {
        res.status(403).json({
          success: false,
          error: "Not authorized to create dispute for this job",
        });
        return;
      }

      // Only allow disputes for jobs in certain statuses
      if (!["escrow_funded", "in_progress", "completed"].includes(job.status)) {
        res.status(400).json({
          success: false,
          error: "Disputes can only be created for funded or in-progress jobs",
        });
        return;
      }

      // Determine other party
      const otherId =
        job.customerId === req.userId ? job.painterId : job.customerId;

      if (!otherId) {
        res.status(400).json({
          success: false,
          error: "Cannot create dispute - other party not found",
        });
        return;
      }

      // Create dispute
      const dispute = await prisma.dispute.create({
        data: {
          jobId,
          initiatedBy: req.userId!,
          otherId,
          reason,
          description: description || "",
          status: "open",
        },
        include: {
          job: true,
          initiatedByUser: {
            select: { id: true, email: true, userType: true },
          },
          otherUser: {
            select: { id: true, email: true, userType: true },
          },
        },
      });

      // Add initial evidence if provided
      if (evidence && evidence.length > 0) {
        for (const item of evidence) {
          await prisma.evidenceSubmission.create({
            data: {
              disputeId: dispute.id,
              submittedBy: req.userId!,
              evidence: item,
            },
          });
        }
      }

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "dispute" },
      });

      // Notify the other party
      await prisma.notification.create({
        data: {
          userId: otherId,
          jobId,
          type: "dispute_raised",
          title: "Dispute Raised",
          body: `A dispute has been raised for your job: ${reason}`,
        },
      });

      const response: ApiResponse<DisputeResponse> = {
        success: true,
        data: formatDisputeResponse(dispute),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Create dispute error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/disputes/:id
 * Get dispute details
 */
router.get(
  "/:disputeId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { disputeId } = req.params;

      const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: {
          job: true,
          initiatedByUser: {
            select: { id: true, email: true, userType: true },
          },
          otherUser: {
            select: { id: true, email: true, userType: true },
          },
          evidence: {
            include: {
              dispute: false,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!dispute) {
        res.status(404).json({
          success: false,
          error: "Dispute not found",
        });
        return;
      }

      // Check authorization
      if (
        dispute.initiatedBy !== req.userId &&
        dispute.otherId !== req.userId
      ) {
        // Allow admin users to view
        const isAdmin = req.isAdmin || false; // Assumes isAdmin is set in middleware
        if (!isAdmin) {
          res.status(403).json({
            success: false,
            error: "Not authorized to view this dispute",
          });
          return;
        }
      }

      const response: ApiResponse<DisputeResponse> = {
        success: true,
        data: formatDisputeResponse(dispute),
      };

      res.json(response);
    } catch (error) {
      console.error("Get dispute error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/disputes
 * List disputes (admin only or user's own disputes)
 */
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, page = 1, pageSize = 20 } = req.query;
      const pageNum = Math.max(1, Number(page));
      const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)));

      let where: any = {};

      // Non-admins only see their own disputes
      if (!req.isAdmin) {
        where = {
          OR: [{ initiatedBy: req.userId }, { otherId: req.userId }],
        };
      }

      // Filter by status if provided
      if (status) {
        where = { ...where, status: String(status) };
      }

      const [disputes, total] = await Promise.all([
        prisma.dispute.findMany({
          where,
          include: {
            job: true,
            initiatedByUser: {
              select: { id: true, email: true, userType: true },
            },
            otherUser: {
              select: { id: true, email: true, userType: true },
            },
            evidence: {
              select: { id: true, submittedBy: true, createdAt: true },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNum - 1) * pageSizeNum,
          take: pageSizeNum,
        }),
        prisma.dispute.count({ where }),
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          disputes: disputes.map(formatDisputeResponse),
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      };

      res.json(response);
    } catch (error) {
      console.error("List disputes error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/disputes/:id/evidence
 * Submit evidence for a dispute
 */
router.post(
  "/:disputeId/evidence",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { disputeId } = req.params;
      const { evidence } = req.body;

      if (!evidence) {
        res.status(400).json({
          success: false,
          error: "evidence is required",
        });
        return;
      }

      const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
      });

      if (!dispute) {
        res.status(404).json({
          success: false,
          error: "Dispute not found",
        });
        return;
      }

      // Check authorization
      if (
        dispute.initiatedBy !== req.userId &&
        dispute.otherId !== req.userId
      ) {
        res.status(403).json({
          success: false,
          error: "Not authorized to submit evidence for this dispute",
        });
        return;
      }

      // Only allow evidence submission for open disputes
      if (dispute.status !== "open") {
        res.status(400).json({
          success: false,
          error:
            "Cannot submit evidence for disputes that are already resolved",
        });
        return;
      }

      const evidenceSubmission = await prisma.evidenceSubmission.create({
        data: {
          disputeId,
          submittedBy: req.userId!,
          evidence,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          id: evidenceSubmission.id,
          disputeId: evidenceSubmission.disputeId,
          submittedBy: evidenceSubmission.submittedBy,
          createdAt: evidenceSubmission.createdAt.toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Submit evidence error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * PUT /api/disputes/:id
 * Resolve dispute (admin only)
 */
router.put(
  "/:disputeId",
  authMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { disputeId } = req.params;
      const {
        status,
        resolution,
        customerRefundAmount,
        painterCompensationAmount,
      } = req.body;

      if (!status || !resolution) {
        res.status(400).json({
          success: false,
          error: "status and resolution are required",
        });
        return;
      }

      if (!["resolved", "closed"].includes(status)) {
        res.status(400).json({
          success: false,
          error: "status must be 'resolved' or 'closed'",
        });
        return;
      }

      const dispute = await prisma.dispute.findUnique({
        where: { id: disputeId },
        include: { job: true },
      });

      if (!dispute) {
        res.status(404).json({
          success: false,
          error: "Dispute not found",
        });
        return;
      }

      // Update dispute
      const updatedDispute = await prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status,
          resolution,
          customerRefundAmount: customerRefundAmount || null,
          painterCompensationAmount: painterCompensationAmount || null,
          resolvedAt: new Date(),
        },
        include: {
          job: true,
          initiatedByUser: {
            select: { id: true, email: true, userType: true },
          },
          otherUser: {
            select: { id: true, email: true, userType: true },
          },
          evidence: true,
        },
      });

      // Process refunds if amounts specified
      if (customerRefundAmount && customerRefundAmount > 0) {
        const escrowTransaction = await prisma.escrowTransaction.findFirst({
          where: { jobId: dispute.jobId },
        });

        if (escrowTransaction) {
          // Update escrow transaction to reflect refund
          await prisma.escrowTransaction.update({
            where: { id: escrowTransaction.id },
            data: {
              cancelled: true,
              cancellationType: "post_escrow",
              cancellationReason: `Dispute resolution: ${resolution}`,
            },
          });
        }
      }

      // Update job status back to approved (dispute resolved)
      await prisma.job.update({
        where: { id: dispute.jobId },
        data: { status: "approved" },
      });

      // Notify both parties
      const notificationData = {
        title: "Dispute Resolved",
        body: `Your dispute has been resolved: ${resolution}`,
      };

      await Promise.all([
        prisma.notification.create({
          data: {
            userId: dispute.initiatedBy,
            jobId: dispute.jobId,
            type: "dispute_raised",
            title: notificationData.title,
            body: notificationData.body,
          },
        }),
        prisma.notification.create({
          data: {
            userId: dispute.otherId,
            jobId: dispute.jobId,
            type: "dispute_raised",
            title: notificationData.title,
            body: notificationData.body,
          },
        }),
      ]);

      const response: ApiResponse<DisputeResponse> = {
        success: true,
        data: formatDisputeResponse(updatedDispute),
      };

      res.json(response);
    } catch (error) {
      console.error("Resolve dispute error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

// Helper function
function formatDisputeResponse(dispute: any): DisputeResponse {
  return {
    id: dispute.id,
    jobId: dispute.jobId,
    initiatedBy: dispute.initiatedBy,
    otherId: dispute.otherId,
    initiatedByUser: dispute.initiatedByUser,
    otherUser: dispute.otherUser,
    reason: dispute.reason,
    description: dispute.description,
    status: dispute.status,
    resolution: dispute.resolution,
    customerRefundAmount: dispute.customerRefundAmount,
    painterCompensationAmount: dispute.painterCompensationAmount,
    evidence: dispute.evidence
      ? dispute.evidence.map((e: any) => ({
          id: e.id,
          submittedBy: e.submittedBy,
          evidence: e.evidence,
          createdAt: e.createdAt.toISOString(),
        }))
      : [],
    createdAt: dispute.createdAt.toISOString(),
    openedAt: dispute.openedAt.toISOString(),
    resolvedAt: dispute.resolvedAt?.toISOString(),
  };
}

export default router;
