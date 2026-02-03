import { Request, Response, NextFunction } from "express";
import { getPrismaClient } from "@server/lib/db";

const prisma = getPrismaClient();

/**
 * Extend Express Request interface with admin properties
 */
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
      adminLevel?: "super" | "moderator" | "support";
    }
  }
}

/**
 * Admin middleware - Check if user is an admin
 * For MVP, we'll check if user has admin role in database
 * In production, use proper admin service/table
 */
export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // For MVP, check if user email is in admin list
    // In production, add proper admin table
    const adminEmails = [
      "admin@paintbookco.com",
      "support@paintbookco.com",
      "oluwakorede@paintbookco.com",
    ];

    if (adminEmails.includes(req.userEmail || "")) {
      req.isAdmin = true;
      req.adminLevel = "super";
      next();
    } else {
      res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

/**
 * Require admin middleware - ensures user is authenticated and is admin
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId || !req.isAdmin) {
    res.status(403).json({
      success: false,
      error: "Admin access required",
    });
    return;
  }
  next();
}
