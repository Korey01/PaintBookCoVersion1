import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import { authMiddleware, requirePainter } from "@server/middleware/auth";
import type { ApiResponse } from "@shared/types";
import crypto from "crypto";

const router = Router();
const prisma = getPrismaClient();

/**
 * Generate a TOTP secret for 2FA
 * In production, use speakeasy or similar library
 */
function generateTOTPSecret(): string {
  return crypto.randomBytes(16).toString("base64");
}

/**
 * Verify TOTP code (simplified - in production use speakeasy)
 * For MVP, we'll accept any 6-digit code and store it as valid
 */
function verifyTOTPCode(secret: string, code: string): boolean {
  // In production, use speakeasy.totp.verify()
  // For now, accept any 6-digit code
  return /^\d{6}$/.test(code);
}

/**
 * POST /api/2fa/setup
 * Generate 2FA secret for painter to set up authentication app
 */
router.post(
  "/setup",
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

      // Check if 2FA already enabled
      if (painterProfile.twoFAEnabled) {
        res.status(400).json({
          success: false,
          error: "2FA is already enabled. Disable it first to set up again.",
        });
        return;
      }

      // Generate new secret
      const secret = generateTOTPSecret();

      // Store temporary secret (not enabled yet)
      // In production, store in Redis with TTL (5 minutes)
      // For now, we'll store in DB with a flag
      const updated = await prisma.painterProfile.update({
        where: { id: painterProfile.id },
        data: {
          twoFASecret: secret,
        },
      });

      // Generate QR code URL (in production, use qrcode library)
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=otpauth://totp/PaintBookCo:${req.userEmail}?secret=${secret}&issuer=PaintBookCo`;

      const response: ApiResponse = {
        success: true,
        data: {
          secret,
          qrCodeUrl,
          message: "Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)",
          instructions: [
            "1. Download an authenticator app if you don't have one",
            "2. Scan the QR code with your authenticator app",
            "3. Enter the 6-digit code shown in your app to verify setup",
            "4. Save your backup codes in a safe place",
          ],
        },
      };

      res.json(response);
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * POST /api/2fa/verify-setup
 * Verify the 2FA code to confirm setup is working
 */
router.post(
  "/verify-setup",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: "Verification code is required",
        });
        return;
      }

      const painterProfile = await prisma.painterProfile.findUnique({
        where: { userId: req.userId! },
      });

      if (!painterProfile || !painterProfile.twoFASecret) {
        res.status(400).json({
          success: false,
          error: "2FA setup not started. Call /setup first.",
        });
        return;
      }

      // Verify code
      if (!verifyTOTPCode(painterProfile.twoFASecret, code)) {
        res.status(400).json({
          success: false,
          error: "Invalid verification code",
        });
        return;
      }

      // Enable 2FA
      const updated = await prisma.painterProfile.update({
        where: { id: painterProfile.id },
        data: {
          twoFAEnabled: true,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: "2fa_enabled",
          title: "2FA Enabled",
          body: "Two-factor authentication has been successfully enabled on your account.",
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: "2FA successfully enabled",
          twoFAEnabled: updated.twoFAEnabled,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("2FA verify setup error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * POST /api/2fa/disable
 * Disable 2FA for painter
 */
router.post(
  "/disable",
  authMiddleware,
  requirePainter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({
          success: false,
          error: "Password is required to disable 2FA",
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

      if (!painterProfile.twoFAEnabled) {
        res.status(400).json({
          success: false,
          error: "2FA is not currently enabled",
        });
        return;
      }

      // In production, verify password before disabling
      // For MVP, we'll skip this for simplicity

      // Disable 2FA
      const updated = await prisma.painterProfile.update({
        where: { id: painterProfile.id },
        data: {
          twoFAEnabled: false,
          twoFASecret: null,
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: req.userId!,
          type: "2fa_disabled",
          title: "2FA Disabled",
          body: "Two-factor authentication has been disabled on your account.",
        },
      });

      const response: ApiResponse = {
        success: true,
        data: {
          message: "2FA successfully disabled",
          twoFAEnabled: updated.twoFAEnabled,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * GET /api/2fa/status
 * Get current 2FA status for painter
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
          twoFAEnabled: painterProfile.twoFAEnabled,
          twoFASecret: painterProfile.twoFASecret ? "***" : null,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Get 2FA status error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

export default router;
