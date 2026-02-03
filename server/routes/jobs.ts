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

    // Create notification for painters in this location
    // TODO: Implement painter notifications based on location

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
