import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader, verifyToken } from "@server/lib/auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userType?: "customer" | "painter";
    }
  }
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ success: false, error: "No token provided" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: "Invalid token" });
    return;
  }

  req.userId = payload.id;
  req.userEmail = payload.email;
  req.userType = payload.userType;

  next();
}

/**
 * Middleware to ensure user is authenticated
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.userId) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }
  next();
}

/**
 * Middleware to ensure user is a customer
 */
export function requireCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.userType !== "customer") {
    res.status(403).json({
      success: false,
      error: "This action requires a customer account",
    });
    return;
  }
  next();
}

/**
 * Middleware to ensure user is a painter
 */
export function requirePainter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.userType !== "painter") {
    res.status(403).json({
      success: false,
      error: "This action requires a painter account",
    });
    return;
  }
  next();
}

/**
 * Optional auth middleware - doesn't fail if no token, but adds user info if available
 */
export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.id;
      req.userEmail = payload.email;
      req.userType = payload.userType;
    }
  }

  next();
}
