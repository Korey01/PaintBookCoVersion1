import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requirePainter, requireCustomer } from "@server/middleware/auth";
import type { CreateQuoteRequest, QuoteResponse, ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/quotes
 * Create a new quote (painter only)
 */
router.post("/", authMiddleware, requirePainter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, jobPrice, consultationFee = 0 }: CreateQuoteRequest = req.body;

    // Validation
    if (!jobId || !jobPrice) {
      res.status(400).json({
        success: false,
        error: "jobId and jobPrice are required",
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

    // Check if job is open or quote_requested
    if (!["open", "quote_requested"].includes(job.status)) {
      res.status(400).json({
        success: false,
        error: "Cannot submit quote for job in this status",
      });
      return;
    }

    // Check if painter already submitted quote
    const existingQuote = await prisma.quote.findFirst({
      where: {
        jobId,
        painterId: req.userId,
      },
    });

    if (existingQuote) {
      res.status(400).json({
        success: false,
        error: "You have already submitted a quote for this job",
      });
      return;
    }

    // Validate pricing
    if (jobPrice < 0 || consultationFee < 0) {
      res.status(400).json({
        success: false,
        error: "Prices cannot be negative",
      });
      return;
    }

    // Create quote
    const quote = await prisma.quote.create({
      data: {
        jobId,
        painterId: req.userId!,
        jobPrice,
        consultationFee,
        totalPrice: jobPrice + consultationFee,
        status: "pending",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update job status if it was open
    if (job.status === "open") {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "quote_received" },
      });
    }

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: job.customerId,
        jobId,
        type: "quote_received",
        title: "Quote Received",
        body: `A new quote of £${quote.totalPrice} has been submitted for your job`,
      },
    });

    const response: ApiResponse<QuoteResponse> = {
      success: true,
      data: formatQuoteResponse(quote),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create quote error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/quotes/:id
 * Get quote details
 */
router.get("/:quoteId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { quoteId } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        job: true,
        painter: true,
      },
    });

    if (!quote) {
      res.status(404).json({
        success: false,
        error: "Quote not found",
      });
      return;
    }

    // Check authorization
    if (quote.job.customerId !== req.userId && quote.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to view this quote",
      });
      return;
    }

    const response: ApiResponse<QuoteResponse> = {
      success: true,
      data: formatQuoteResponse(quote),
    };

    res.json(response);
  } catch (error) {
    console.error("Get quote error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/jobs/:jobId/quotes
 * List quotes for a job
 */
router.get("/job/:jobId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
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

    // Check authorization - only customer or associated painter
    if (job.customerId !== req.userId && job.painterId !== req.userId) {
      res.status(403).json({
        success: false,
        error: "Not authorized to view quotes for this job",
      });
      return;
    }

    const quotes = await prisma.quote.findMany({
      where: { jobId },
      include: {
        painter: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        quotes: quotes.map(formatQuoteResponse),
        total: quotes.length,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("List quotes error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * PUT /api/quotes/:id
 * Accept or reject quote (customer only)
 */
router.put("/:quoteId", authMiddleware, requireCustomer, async (req: Request, res: Response): Promise<void> => {
  try {
    const { quoteId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validation
    if (!status) {
      res.status(400).json({
        success: false,
        error: "status is required",
      });
      return;
    }

    if (!["accepted", "rejected"].includes(status)) {
      res.status(400).json({
        success: false,
        error: "status must be 'accepted' or 'rejected'",
      });
      return;
    }

    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      res.status(404).json({
        success: false,
        error: "Quote not found",
      });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: quote.jobId },
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
        error: "Not authorized to accept/reject this quote",
      });
      return;
    }

    if (quote.status !== "pending") {
      res.status(400).json({
        success: false,
        error: "Quote is no longer pending",
      });
      return;
    }

    // Update quote
    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        status,
        rejectionReason: status === "rejected" ? rejectionReason : null,
        acceptedAt: status === "accepted" ? new Date() : null,
      },
    });

    // Update job if accepted
    if (status === "accepted") {
      // Get painter's profile to get the correct profileId
      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: quote.painterId },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      await prisma.job.update({
        where: { id: quote.jobId },
        data: {
          status: "quote_accepted",
          painterId: painterProfile.id,
          escrowAmount: quote.totalPrice,
        },
      });

      // Create notification for painter
      await prisma.notification.create({
        data: {
          userId: quote.painterId,
          jobId: quote.jobId,
          type: "quote_accepted",
          title: "Quote Accepted!",
          body: `Your quote of £${quote.totalPrice} has been accepted`,
        },
      });
    } else {
      // Create notification for painter about rejection
      await prisma.notification.create({
        data: {
          userId: quote.painterId,
          jobId: quote.jobId,
          type: "quote_received",
          title: "Quote Rejected",
          body: rejectionReason ? `Your quote was rejected: ${rejectionReason}` : "Your quote was rejected",
        },
      });
    }

    const response: ApiResponse<QuoteResponse> = {
      success: true,
      data: formatQuoteResponse(updatedQuote),
    };

    res.json(response);
  } catch (error) {
    console.error("Update quote error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

// Helper function to format quote response
function formatQuoteResponse(quote: any): QuoteResponse {
  return {
    id: quote.id,
    jobId: quote.jobId,
    painterId: quote.painterId,
    jobPrice: quote.jobPrice,
    consultationFee: quote.consultationFee,
    totalPrice: quote.totalPrice,
    status: quote.status,
    rejectionReason: quote.rejectionReason,
    negotiationHistory: quote.negotiationHistory || [],
    createdAt: quote.createdAt.toISOString(),
    acceptedAt: quote.acceptedAt?.toISOString(),
    expiresAt: quote.expiresAt?.toISOString(),
  };
}

export default router;
