import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware } from "@server/middleware/auth";
import { getPainterReputation } from "@server/services/reputation";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * GET /api/painters/:painterId/reputation
 * Get painter reputation and reliability metrics
 */
router.get(
  "/:painterId/reputation",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { painterId } = req.params;

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

      const reputation = await getPainterReputation(painterId);

      const response: ApiResponse = {
        success: true,
        data: {
          painterId,
          reputation,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get painter reputation error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

/**
 * GET /api/painters/:painterId
 * Get painter profile details
 */
router.get(
  "/:painterId",
  authMiddleware,
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

      const reputation = await getPainterReputation(painterId);

      const response: ApiResponse = {
        success: true,
        data: {
          id: painter.id,
          userId: painter.userId,
          firstName: painter.firstName,
          lastName: painter.lastName,
          businessName: painter.businessName,
          businessType: painter.businessType,
          bio: painter.bio,
          phone: painter.businessPhone || painter.phone,
          address: painter.address,
          city: painter.city,
          postcode: painter.postcode,
          serviceRadius: painter.serviceRadius,
          skills: painter.skills,
          availability: painter.availability,
          rateMin: painter.rateMin,
          rateMax: painter.rateMax,
          portfolioImages: painter.portfolioImages,
          verificationStatus: painter.verificationStatus,
          hasInsurance: painter.hasInsurance,
          tier: painter.tier,
          reputation,
          user: painter.user,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get painter profile error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

export default router;
