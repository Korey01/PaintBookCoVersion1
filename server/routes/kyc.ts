import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requirePainter } from "@server/middleware/auth";
import { adminMiddleware, requireAdmin } from "@server/middleware/admin";
import type { ApiResponse, KYCVerificationRequest } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/kyc/submit
 * Submit KYC information for painter verification
 * Painters only
 */
router.post(
  "/submit",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        firstName,
        lastName,
        dateOfBirth,
        businessName,
        businessRegistration,
        businessType,
        address,
        city,
        postcode,
        phone,
        businessPhone,
        insuranceProvider,
        insurancePolicyNumber,
        insuranceExpiry,
        hasInsurance,
      }: KYCVerificationRequest = req.body;

      // Validation
      if (!firstName || !lastName || !dateOfBirth || !address || !postcode) {
        res.status(400).json({
          success: false,
          error:
            "firstName, lastName, dateOfBirth, address, and postcode are required",
        });
        return;
      }

      // Get painter profile
      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      // Update painter profile with KYC information
      const updated = await prisma.painterProfile.update({
        where: { id: painterProfile.id },
        data: {
          // Personal info
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          phone,

          // Business info
          businessName,
          businessRegistration,
          businessType,
          address,
          city,
          postcode,
          businessPhone,

          // Insurance
          hasInsurance,
          insuranceProvider,
          insurancePolicyNumber,
          insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,

          // Set verification status to under_review
          verificationStatus: "under_review",
        },
        include: {
          user: true,
        },
      });

      // Note: KYC notifications are not job-related, so we skip creating them here
      // In a future enhancement, we could add a separate NotificationMessage model for non-job notifications

      const response: ApiResponse = {
        success: true,
        data: {
          message: "KYC information submitted successfully",
          verificationStatus: updated.verificationStatus,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("KYC submit error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/kyc/status
 * Get current KYC verification status for painter
 */
router.get(
  "/status",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          verificationStatus: painterProfile.verificationStatus,
          idDocuments: painterProfile.idDocuments
            ? painterProfile.idDocuments.length
            : 0,
          insuranceDocs: painterProfile.insuranceDocs
            ? painterProfile.insuranceDocs.length
            : 0,
          hasInsurance: painterProfile.hasInsurance,
          kycCompletedAt: painterProfile.kycCompletedAt,
          kycRejectionReason: painterProfile.kycRejectionReason,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get KYC status error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/kyc/documents/upload
 * Upload KYC documents (ID, insurance, etc.)
 */
router.post(
  "/documents/upload",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { documentType, documentUrl, documentExpiry } = req.body;

      // Validation
      if (!documentType || !documentUrl) {
        res.status(400).json({
          success: false,
          error: "documentType and documentUrl are required",
        });
        return;
      }

      if (
        !["id_document", "insurance", "address_proof"].includes(documentType)
      ) {
        res.status(400).json({
          success: false,
          error:
            "Invalid documentType. Must be 'id_document', 'insurance', or 'address_proof'",
        });
        return;
      }

      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      // Store document based on type
      let updatedProfile;
      if (documentType === "id_document") {
        updatedProfile = await prisma.painterProfile.update({
          where: { id: painterProfile.id },
          data: {
            idDocuments: [
              ...(painterProfile.idDocuments || []),
              {
                url: documentUrl,
                uploadedAt: new Date(),
                expiresAt: documentExpiry ? new Date(documentExpiry) : null,
              },
            ],
          },
        });
      } else if (documentType === "insurance") {
        updatedProfile = await prisma.painterProfile.update({
          where: { id: painterProfile.id },
          data: {
            insuranceDocs: [
              ...(painterProfile.insuranceDocs || []),
              {
                url: documentUrl,
                uploadedAt: new Date(),
                expiresAt: documentExpiry ? new Date(documentExpiry) : null,
              },
            ],
          },
        });
      } else {
        updatedProfile = await prisma.painterProfile.update({
          where: { id: painterProfile.id },
          data: {
            addressProofDocuments: [
              ...(painterProfile.addressProofDocuments || []),
              {
                url: documentUrl,
                uploadedAt: new Date(),
              },
            ],
          },
        });
      }

      const response: ApiResponse = {
        success: true,
        data: {
          message: `${documentType} uploaded successfully`,
          documentCount:
            documentType === "id_document"
              ? updatedProfile.idDocuments?.length || 0
              : documentType === "insurance"
                ? updatedProfile.insuranceDocs?.length || 0
                : updatedProfile.addressProofDocuments?.length || 0,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/kyc/documents
 * Get list of uploaded documents for painter
 */
router.get(
  "/documents",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: {
          idDocuments: painterProfile.idDocuments || [],
          insuranceDocs: painterProfile.insuranceDocs || [],
          addressProofDocuments: painterProfile.addressProofDocuments || [],
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * POST /api/kyc/verify
 * Admin endpoint to approve/reject KYC verification
 * Requires admin authentication
 */
router.post(
  "/verify",
  authMiddleware,
  adminMiddleware,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { painterId, status, rejectionReason } = req.body;

      if (!painterId || !status) {
        res.status(400).json({
          success: false,
          error: "painterId and status are required",
        });
        return;
      }

      if (!["approved", "denied"].includes(status)) {
        res.status(400).json({
          success: false,
          error: "status must be 'approved' or 'denied'",
        });
        return;
      }

      const painterProfile = await prisma.painterProfile.findUnique({
        where: { id: painterId },
      });

      if (!painterProfile) {
        res.status(404).json({
          success: false,
          error: "Painter profile not found",
        });
        return;
      }

      const updated = await prisma.painterProfile.update({
        where: { id: painterId },
        data: {
          verificationStatus: status === "approved" ? "approved" : "denied",
          kycCompletedAt: new Date(),
          kycRejectionReason: status === "denied" ? rejectionReason : null,
        },
      });

      // Create notification for painter
      await prisma.notification.create({
        data: {
          userId: painterProfile.userId,
          type: status === "approved" ? "kyc_approved" : "kyc_rejected",
          title: status === "approved" ? "KYC Approved!" : "KYC Rejected",
          body:
            status === "approved"
              ? "Congratulations! Your KYC verification has been approved. You can now start accepting jobs."
              : `Your KYC verification has been rejected. Reason: ${rejectionReason}. Please resubmit with corrections.`,
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: `KYC verification ${status}`,
          verificationStatus: updated.verificationStatus,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("KYC verify error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

export default router;
