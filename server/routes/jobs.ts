import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requireCustomer, requireAuth } from "@server/middleware/auth";
import type { CreateJobRequest, JobResponse, ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/jobs
 * Create a new job (customer only)
 */
router.post("/", authMiddleware, requireCustomer, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      jobType,
      title,
      description,
      postcode,
      budgetMin,
      budgetMax,
      images,
      paintBrand,
      rooms,
      estimatedMaterialCost,
      estimatedLitres,
      estimatedWallArea,
      useEscrow = true,
      customerEmail,
      customerPhone,
    }: CreateJobRequest = req.body;

    // Validation
    if (!jobType || !title || !postcode) {
      res.status(400).json({
        success: false,
        error: "jobType, title, and postcode are required",
      });
      return;
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        customerId: req.userId!,
        jobType,
        title,
        description,
        postcode,
        budgetMin,
        budgetMax,
        images: images || [],
        paintBrand,
        rooms: (rooms || []) as any,
        estimatedMaterialCost,
        estimatedLitres,
        estimatedWallArea,
        useEscrow,
        customerEmail,
        customerPhone,
        status: "open",
      },
    });

    // Notify painters in this location about the new job (async, don't block response)
    // In production, use a queue system like Bull or RabbitMQ
    try {
      const painters = await prisma.painterProfile.findMany({
        where: {
          verificationStatus: "approved",
          postcode: job.postcode,
        },
        select: { userId: true },
      });

      for (const painter of painters) {
        await prisma.notification.create({
          data: {
            userId: painter.userId,
            jobId: job.id,
            type: "job_posted", // Use job_posted enum value
            title: "New Job Available",
            body: `A new ${job.jobType} painting job is available: "${job.title}"`,
          },
        });
      }
    } catch (notificationError) {
      // Don't fail job creation if notification fails
      console.error("Error notifying painters:", notificationError);
    }

    const response: ApiResponse<JobResponse> = {
      success: true,
      data: formatJobResponse(job),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/jobs/:id
 * Get job details
 */
router.get("/:jobId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        customer: true,
        painter: true,
        quotes: true,
        escrowTransactions: true,
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Check authorization - must be customer, painter, or admin
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to view this job",
      });
      return;
    }

    const response: ApiResponse<JobResponse> = {
      success: true,
      data: formatJobResponse(job),
    };

    res.json(response);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/jobs
 * List jobs (filters based on user type)
 * - Customers see their own jobs
 * - Painters see open jobs in their location
 */
router.get("/", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = 1, pageSize = 10, postcode } = req.query;

    const pageNum = Math.max(1, Number(page));
    const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)));

    let jobs;
    let total;

    if (req.userType === "customer") {
      // Customers see their own jobs
      [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where: {
            customerId: req.userId,
            ...(status && { status: String(status) }),
          },
          include: {
            customer: true,
            painter: true,
            quotes: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNum - 1) * pageSizeNum,
          take: pageSizeNum,
        }),
        prisma.job.count({
          where: {
            customerId: req.userId,
            ...(status && { status: String(status) }),
          },
        }),
      ]);
    } else if (req.userType === "painter") {
      // Painters see open jobs in their location
      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId },
      });

      if (!painterProfile) {
        res.status(400).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where: {
            status: "open",
            postcode: postcode ? String(postcode) : painterProfile.postcode,
          },
          include: {
            customer: true,
            painter: true,
            quotes: true,
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNum - 1) * pageSizeNum,
          take: pageSizeNum,
        }),
        prisma.job.count({
          where: {
            status: "open",
            postcode: postcode ? String(postcode) : painterProfile.postcode,
          },
        }),
      ]);
    } else {
      res.status(403).json({
        success: false,
        error: "Not authorized",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: {
        jobs: jobs.map(formatJobResponse),
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("List jobs error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * PUT /api/jobs/:id
 * Update job (customer only, before quotes accepted)
 */
router.put("/:jobId", authMiddleware, requireCustomer, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { title, description, budgetMin, budgetMax, images, paintBrand, rooms } = req.body;

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

    if (job.customerId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to update this job",
      });
      return;
    }

    if (job.status !== "open") {
      res.status(400).json({
        success: false,
        error: "Can only update jobs in open status",
      });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(budgetMin && { budgetMin }),
        ...(budgetMax && { budgetMax }),
        ...(images && { images }),
        ...(paintBrand && { paintBrand }),
        ...(rooms && { rooms: rooms as any }),
      },
    });

    const response: ApiResponse<JobResponse> = {
      success: true,
      data: formatJobResponse(updatedJob),
    };

    res.json(response);
  } catch (error) {
    console.error("Update job error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/jobs/:id/cancel
 * Cancel job with full refund logic
 * Pre-escrow: Customer gets 100%
 * Post-escrow: Customer 75%, Painter 12%, PaintBookCo 13%
 */
router.post("/:jobId/cancel", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        escrowTransactions: true,
        painter: true,
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        error: "Job not found",
      });
      return;
    }

    // Authorization: customer or painter can cancel
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to cancel this job",
      });
      return;
    }

    // Only allow cancellation for certain statuses
    if (!["open", "quote_received", "quote_accepted", "escrow_funded", "in_progress"].includes(job.status)) {
      res.status(400).json({
        success: false,
        error: "This job cannot be cancelled in its current status",
      });
      return;
    }

    const escrowTransaction = job.escrowTransactions?.[0];
    let refundData: any = {};

    // Handle refund logic
    if (escrowTransaction && escrowTransaction.status === "funded") {
      // POST-ESCROW CANCELLATION: Customer 75%, Painter 12%, PaintBookCo 13%
      const totalAmount = escrowTransaction.totalAmount;
      const customerRefund = Math.round(totalAmount * 0.75 * 100) / 100;
      const painterCompensation = Math.round(totalAmount * 0.12 * 100) / 100;
      const paintbookcoKeeps = Math.round(totalAmount * 0.13 * 100) / 100;

      refundData = {
        customerRefundAmount: customerRefund,
        painterCompensationAmount: painterCompensation,
        cancellationType: "post_escrow",
      };

      // Update escrow transaction
      await prisma.escrowTransaction.update({
        where: { id: escrowTransaction.id },
        data: {
          cancelled: true,
          cancellationType: "post_escrow",
          cancellationReason: reason || "Job cancelled",
          customerPaidAmount: customerRefund,
          painterPaidAmount: painterCompensation,
        },
      });
    } else if (job.escrowStatus === "not_initiated" || job.escrowStatus === "pending") {
      // PRE-ESCROW CANCELLATION: Customer gets 100%
      refundData = {
        customerRefundAmount: job.escrowAmount || 0,
        painterCompensationAmount: 0,
        cancellationType: "pre_escrow",
      };

      if (escrowTransaction) {
        await prisma.escrowTransaction.update({
          where: { id: escrowTransaction.id },
          data: {
            cancelled: true,
            cancellationType: "pre_escrow",
            cancellationReason: reason || "Job cancelled",
            customerPaidAmount: job.escrowAmount || 0,
            painterPaidAmount: 0,
          },
        });
      }
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status: "cancelled" },
    });

    // Notify other party
    const otherUserId = job.customerId === req.userId ? job.painterId : job.customerId;
    if (otherUserId) {
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          jobId,
          type: "job_complete",
          title: "Job Cancelled",
          body: `The job "${job.title}" has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: updatedJob.id,
        status: "cancelled",
        ...refundData,
      },
    });
  } catch (error) {
    console.error("Cancel job error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * DELETE /api/jobs/:id
 * Cancel/delete job (customer only, before escrow funded)
 */
router.delete("/:jobId", authMiddleware, requireCustomer, async (req: Request, res: Response): Promise<void> => {
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

    if (job.customerId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to delete this job",
      });
      return;
    }

    if (job.escrowStatus !== "not_initiated") {
      res.status(400).json({
        success: false,
        error: "Cannot delete job after escrow is initiated",
      });
      return;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "cancelled" },
    });

    res.json({
      success: true,
      data: { id: jobId, status: "cancelled" },
    });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Helper function to format job response
function formatJobResponse(job: any): JobResponse {
  return {
    id: job.id,
    jobType: job.jobType,
    title: job.title,
    description: job.description,
    postcode: job.postcode,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    images: job.images,
    paintBrand: job.paintBrand,
    rooms: job.rooms || [],
    estimatedMaterialCost: job.estimatedMaterialCost,
    estimatedLitres: job.estimatedLitres,
    estimatedWallArea: job.estimatedWallArea,
    useEscrow: job.useEscrow,
    status: job.status,
    painterId: job.painterId,
    escrowAmount: job.escrowAmount,
    escrowStatus: job.escrowStatus,
    customerEmail: job.customerEmail,
    customerPhone: job.customerPhone,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export default router;
