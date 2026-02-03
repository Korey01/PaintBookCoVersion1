import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requireCustomer } from "@server/middleware/auth";
import { transpactService } from "@server/services/transpact";
import type {
  InitiatePaymentRequest,
  PaymentResponse,
  EscrowTransactionResponse,
  ApiResponse,
} from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/payments/initiate
 * Initiate escrow payment (customer only)
 * Integration with Transpact for escrow service
 */
router.post(
  "/initiate",
  authMiddleware,
  requireCustomer,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId, amount, paymentMethod }: InitiatePaymentRequest = req.body;

      // Validation
      if (!jobId || !amount) {
        res.status(400).json({
          success: false,
          error: "jobId and amount are required",
        });
        return;
      }

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: "Amount must be greater than 0",
        });
        return;
      }

      // Get job
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          quotes: {
            where: { status: "accepted" },
          },
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

      if (job.customerId !== req.userId) {
        res.status(403).json({
          success: false,
          error: "Not authorized to pay for this job",
        });
        return;
      }

      if (job.status !== "quote_accepted") {
        res.status(400).json({
          success: false,
          error: "Job must have accepted quote before payment",
        });
        return;
      }

      if (!job.quotes.length) {
        res.status(400).json({
          success: false,
          error: "No accepted quote found for this job",
        });
        return;
      }

      const acceptedQuote = job.quotes[0];

      // Verify amount matches quote
      if (Math.abs(amount - acceptedQuote.totalPrice) > 0.01) {
        res.status(400).json({
          success: false,
          error: `Amount (£${amount}) does not match quote total (£${acceptedQuote.totalPrice})`,
        });
        return;
      }

      // Separate job price and consultation fee
      const jobPrice = acceptedQuote.jobPrice;
      const consultationFee = acceptedQuote.consultationFee || 0;

      // Calculate commission and escrow cost
      const commissionRate = calculateCommissionRate(job.painterId!);
      const commission = jobPrice * (commissionRate / 100); // Commission applies only to job price, not consultation fee
      const escrowCost = calculateEscrowCost(amount); // Transpact fee
      const painterAmount = jobPrice - commission + consultationFee; // Painter gets job price (minus commission) plus full consultation fee

      // Check if escrow transaction already exists
      let escrowTransaction = await prisma.escrowTransaction.findFirst({
        where: { jobId },
      });

      if (!escrowTransaction) {
        // Create escrow transaction
        escrowTransaction = await prisma.escrowTransaction.create({
          data: {
            jobId,
            totalAmount: amount,
            painterbookcoCommission: commission,
            escrowCost: escrowCost,
            painterAmount: painterAmount,
            commissionRate,
            status: "pending",
          },
        });
      }

      // Get customer and painter details
      const customer = await prisma.user.findUnique({
        where: { id: job.customerId },
      });

      if (!job.painter) {
        res.status(400).json({
          success: false,
          error: "Painter information not found for this job",
        });
        return;
      }

      const painterUser = await prisma.user.findUnique({
        where: { id: job.painter.userId },
      });

      if (!customer || !painterUser) {
        res.status(400).json({
          success: false,
          error: "Customer or painter information not found",
        });
        return;
      }

      // Create Transpact transaction via Transpact service
      try {
        const transpactResult = await transpactService.createTransaction({
          transactionId: escrowTransaction.id,
          amount,
          currency: "GBP",
          description: `PaintBookCo: ${job.title}`,
          buyerName: customer.email.split("@")[0],
          buyerEmail: customer.email,
          sellerName: painterUser.email.split("@")[0],
          sellerEmail: painterUser.email,
          webhookUrl: `${process.env.WEBHOOK_URL || "http://localhost:3000"}/api/payments/webhook/transpact`,
          successUrl: `${process.env.APP_URL || "http://localhost:8080"}/payment/success`,
          failureUrl: `${process.env.APP_URL || "http://localhost:8080"}/payment/failed`,
        });

        // Update escrow transaction with Transpact ID and payment URL
        await prisma.escrowTransaction.update({
          where: { id: escrowTransaction.id },
          data: {
            transpactTransactionId: transpactResult.transactionId,
            transpactStatus: "pending",
          },
        });

        const response: ApiResponse<any> = {
          success: true,
          data: {
            escrowTransactionId: escrowTransaction.id,
            transpactTransactionId: transpactResult.transactionId,
            amount,
            jobPrice,
            consultationFee,
            commission,
            escrowCost,
            painterAmount,
            commissionRate,
            paymentUrl: transpactResult.paymentUrl,
            breakdown: {
              jobPrice,
              consultationFee,
              totalAmount: amount,
              painterReceives: painterAmount,
              paintbookcoEarns: commission,
              escrowServiceFee: escrowCost,
            },
          },
        };

        res.status(201).json(response);
      } catch (transpactError) {
        console.error("Transpact API error:", transpactError);
        res.status(500).json({
          success: false,
          error: "Failed to initiate escrow payment with Transpact",
        });
      }
    } catch (error) {
      console.error("Initiate payment error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/payments/escrow/:transactionId
 * Get escrow transaction status
 */
router.get(
  "/escrow/:transactionId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionId } = req.params;

      const escrowTransaction = await prisma.escrowTransaction.findUnique({
        where: { id: transactionId },
        include: {
          job: true,
        },
      });

      if (!escrowTransaction) {
        res.status(404).json({
          success: false,
          error: "Transaction not found",
        });
        return;
      }

      // Check authorization
      if (
        escrowTransaction.job.customerId !== req.userId &&
        escrowTransaction.job.painterId !== req.userId
      ) {
        res.status(403).json({
          success: false,
          error: "Not authorized to view this transaction",
        });
        return;
      }

      const response: ApiResponse<EscrowTransactionResponse> = {
        success: true,
        data: formatEscrowTransactionResponse(escrowTransaction),
      };

      res.json(response);
    } catch (error) {
      console.error("Get escrow transaction error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/payments/webhook/transpact
 * Webhook for Transpact to notify of payment status changes
 */
router.post(
  "/webhook/transpact",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { transactionId, status, amount } = req.body;

      // Verify webhook signature (TODO: implement in production)
      // const isValid = verifyTranspactSignature(req);

      // Find escrow transaction
      const escrowTransaction = await prisma.escrowTransaction.findFirst({
        where: { transpactTransactionId: transactionId },
      });

      if (!escrowTransaction) {
        res.status(404).json({
          success: false,
          error: "Transaction not found",
        });
        return;
      }

      // Update transaction status
      const updatedTransaction = await prisma.escrowTransaction.update({
        where: { id: escrowTransaction.id },
        data: {
          transpactStatus: status,
          status: status === "completed" ? "funded" : "pending",
          customerPaidAmount: status === "completed" ? amount : 0,
          fundedAt: status === "completed" ? new Date() : null,
        },
      });

      // Update job status to escrow_funded
      if (status === "completed") {
        await prisma.job.update({
          where: { id: escrowTransaction.jobId },
          data: { status: "escrow_funded" },
        });

        // Create notifications
        const job = await prisma.job.findUnique({
          where: { id: escrowTransaction.jobId },
        });

        if (job) {
          // Notify customer
          await prisma.notification.create({
            data: {
              userId: job.customerId,
              jobId: job.id,
              type: "payment_received",
              title: "Payment Received",
              body: "Your payment has been received and is now in escrow",
            },
          });

          // Notify painter
          if (job.painterId) {
            await prisma.notification.create({
              data: {
                userId: job.painterId,
                jobId: job.id,
                type: "payment_received",
                title: "Job Funded",
                body: "The customer has funded the job. You can now begin work.",
              },
            });
          }
        }
      }

      res.json({
        success: true,
        data: formatEscrowTransactionResponse(updatedTransaction),
      });
    } catch (error) {
      console.error("Transpact webhook error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/payments/release/:jobId
 * Release payment to painter (called when job is approved by customer)
 * ADMIN or SYSTEM only
 */
router.post(
  "/release/:jobId",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
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

      // Only customer can approve payment release
      if (job.customerId !== req.userId) {
        res.status(403).json({
          success: false,
          error: "Only job customer can release payment",
        });
        return;
      }

      const escrowTransaction = await prisma.escrowTransaction.findFirst({
        where: { jobId },
      });

      if (!escrowTransaction) {
        res.status(404).json({
          success: false,
          error: "No escrow transaction found for this job",
        });
        return;
      }

      if (escrowTransaction.status !== "funded") {
        res.status(400).json({
          success: false,
          error: "Escrow transaction must be funded before release",
        });
        return;
      }

      // TODO: Call Transpact API to release funds
      const updatedTransaction = await prisma.escrowTransaction.update({
        where: { id: escrowTransaction.id },
        data: {
          status: "released",
          painterPaidAmount: escrowTransaction.painterAmount,
          releasedAt: new Date(),
        },
      });

      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "approved" },
      });

      // Create notification for painter
      await prisma.notification.create({
        data: {
          userId: job.painterId!,
          jobId,
          type: "job_approved",
          title: "Payment Released",
          body: `£${escrowTransaction.painterAmount} has been released to your account`,
        },
      });

      const response: ApiResponse<EscrowTransactionResponse> = {
        success: true,
        data: formatEscrowTransactionResponse(updatedTransaction),
      };

      res.json(response);
    } catch (error) {
      console.error("Release payment error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

// Helper functions

/**
 * Calculate commission rate based on painter's tier
 * Jobs 1-5: 12%
 * Jobs 6-10: 10%
 * Jobs 11+: 8%
 */
function calculateCommissionRate(painterId: string): number {
  // TODO: Fetch painter's job count and calculate actual tier
  // For now, return default 12%
  return 12;
}

/**
 * Calculate Transpact escrow service fee
 * Typically 2-3% of transaction value
 */
function calculateEscrowCost(amount: number): number {
  return amount * 0.025; // 2.5%
}

function formatEscrowTransactionResponse(
  transaction: any,
): EscrowTransactionResponse {
  return {
    id: transaction.id,
    jobId: transaction.jobId,
    transpactTransactionId: transaction.transpactTransactionId,
    transpactStatus: transaction.transpactStatus,
    totalAmount: transaction.totalAmount,
    painterbookcoCommission: transaction.painterbookcoCommission,
    escrowCost: transaction.escrowCost,
    painterAmount: transaction.painterAmount,
    commissionRate: transaction.commissionRate,
    status: transaction.status,
    customerPaidAmount: transaction.customerPaidAmount,
    painterPaidAmount: transaction.painterPaidAmount,
    fundedAt: transaction.fundedAt?.toISOString(),
    releasedAt: transaction.releasedAt?.toISOString(),
  };
}

export default router;
