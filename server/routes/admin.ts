import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware } from "@server/middleware/auth";
import { adminMiddleware, requireAdmin } from "@server/middleware/admin";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * GET /api/admin/kyc/pending
 * Get all pending KYC verifications (admin only)
 */
router.get(
  "/kyc/pending",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, pageSize = 20, status = "under_review" } = req.query;
      const pageNum = Math.max(1, Number(page));
      const pageSizeNum = Math.min(100, Math.max(1, Number(pageSize)));

      const [painters, total] = await Promise.all([
        prisma.painterProfile.findMany({
          where: {
            verificationStatus: String(status) as any,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNum - 1) * pageSizeNum,
          take: pageSizeNum,
        }),
        prisma.painterProfile.count({
          where: {
            verificationStatus: String(status) as any,
          },
        }),
      ]);

      const response: ApiResponse = {
        success: true,
        data: {
          painters: painters.map((p) => ({
            id: p.id,
            userId: p.user.id,
            email: p.user.email,
            firstName: p.firstName,
            lastName: p.lastName,
            businessName: p.businessName,
            postcode: p.postcode,
            verificationStatus: p.verificationStatus,
            hasInsurance: p.hasInsurance,
            documentsCount: {
              idDocs: (p.idDocuments || []).length,
              insuranceDocs: (p.insuranceDocs || []).length,
              addressProof: (p.addressProofDocuments || []).length,
            },
            submittedAt: p.createdAt,
          })),
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          totalPages: Math.ceil(total / pageSizeNum),
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get pending KYC error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/admin/kyc/:painterId
 * Get detailed KYC information with documents (admin only)
 */
router.get(
  "/kyc/:painterId",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { painterId } = req.params;

      const painter = await prisma.painterProfile.findUnique({
        where: { id: painterId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!painter) {
        res.status(404).json({
          success: false,
          error: "Painter not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: painter.id,
          user: painter.user,
          personal: {
            firstName: painter.firstName,
            lastName: painter.lastName,
            dateOfBirth: painter.dateOfBirth,
            phone: painter.phone,
          },
          business: {
            businessName: painter.businessName,
            businessRegistration: painter.businessRegistration,
            businessType: painter.businessType,
            businessPhone: painter.businessPhone,
          },
          address: {
            address: painter.address,
            city: painter.city,
            postcode: painter.postcode,
          },
          insurance: {
            hasInsurance: painter.hasInsurance,
            provider: painter.insuranceProvider,
            policyNumber: painter.insurancePolicyNumber,
            expiry: painter.insuranceExpiry,
          },
          documents: {
            idDocuments: painter.idDocuments || [],
            insuranceDocs: painter.insuranceDocs || [],
            addressProofDocuments: painter.addressProofDocuments || [],
          },
          verification: {
            status: painter.verificationStatus,
            submittedAt: painter.createdAt,
            completedAt: painter.kycCompletedAt,
            rejectionReason: painter.kycRejectionReason,
          },
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get KYC details error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * POST /api/admin/kyc/:painterId/approve
 * Approve painter KYC (admin only)
 */
router.post(
  "/kyc/:painterId/approve",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { painterId } = req.params;
      const { notes } = req.body;

      const painter = await prisma.painterProfile.findUnique({
        where: { id: painterId },
      });

      if (!painter) {
        res.status(404).json({
          success: false,
          error: "Painter not found",
        });
        return;
      }

      const updated = await prisma.painterProfile.update({
        where: { id: painterId },
        data: {
          verificationStatus: "approved",
          kycCompletedAt: new Date(),
          kycRejectionReason: null,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: painter.userId,
          type: "kyc_approved",
          title: "KYC Approved!",
          body: "Congratulations! Your KYC verification has been approved. You can now start accepting jobs.",
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: "Painter KYC approved",
          painterId: updated.id,
          verificationStatus: updated.verificationStatus,
          approvedAt: updated.kycCompletedAt,
          notes,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Approve KYC error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * POST /api/admin/kyc/:painterId/reject
 * Reject painter KYC with reason (admin only)
 */
router.post(
  "/kyc/:painterId/reject",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { painterId } = req.params;
      const { reason, notes } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          error: "Rejection reason is required",
        });
        return;
      }

      const painter = await prisma.painterProfile.findUnique({
        where: { id: painterId },
      });

      if (!painter) {
        res.status(404).json({
          success: false,
          error: "Painter not found",
        });
        return;
      }

      const updated = await prisma.painterProfile.update({
        where: { id: painterId },
        data: {
          verificationStatus: "denied",
          kycCompletedAt: new Date(),
          kycRejectionReason: reason,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: painter.userId,
          type: "kyc_rejected",
          title: "KYC Verification Rejected",
          body: `Your KYC verification has been rejected. Reason: ${reason}. Please review and resubmit.`,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: "Painter KYC rejected",
          painterId: updated.id,
          verificationStatus: updated.verificationStatus,
          rejectionReason: updated.kycRejectionReason,
          rejectedAt: updated.kycCompletedAt,
          notes,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Reject KYC error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/admin/kyc/stats
 * Get KYC verification statistics (admin only)
 */
router.get(
  "/kyc/stats",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [pending, approved, denied, total] = await Promise.all([
        prisma.painterProfile.count({
          where: { verificationStatus: "pending" },
        }),
        prisma.painterProfile.count({
          where: { verificationStatus: "approved" },
        }),
        prisma.painterProfile.count({
          where: { verificationStatus: "denied" },
        }),
        prisma.painterProfile.count(),
      ]);

      const underReview = total - pending - approved - denied;

      const response: ApiResponse = {
        success: true,
        data: {
          summary: {
            total,
            pending,
            underReview,
            approved,
            denied,
          },
          percentages: {
            approved: ((approved / total) * 100).toFixed(1),
            pending: ((pending / total) * 100).toFixed(1),
            underReview: ((underReview / total) * 100).toFixed(1),
            denied: ((denied / total) * 100).toFixed(1),
          },
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get KYC stats error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/admin/jobs/stats
 * Get job market statistics (admin only)
 */
router.get(
  "/jobs/stats",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [totalJobs, openJobs, completedJobs, totalEarnings] =
        await Promise.all([
          prisma.job.count(),
          prisma.job.count({ where: { status: "open" } }),
          prisma.job.count({ where: { status: "completed" } }),
          prisma.escrowTransaction.aggregate({
            _sum: { totalAmount: true },
          }),
        ]);

      const response: ApiResponse = {
        success: true,
        data: {
          jobs: {
            total: totalJobs,
            open: openJobs,
            completed: completedJobs,
          },
          platform: {
            totalEarnings: totalEarnings._sum?.totalAmount || 0,
          },
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get jobs stats error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

export default router;
