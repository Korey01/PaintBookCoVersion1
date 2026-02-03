import { Router, Request, Response } from "express";
import { getPrismaClient } from "@server/lib/db";
import {
  hashPassword,
  comparePassword,
  generateToken,
  isValidEmail,
  isValidPassword,
} from "@server/lib/auth";
import { authMiddleware } from "@server/middleware/auth";
import type { AuthResponse, UserResponse, RegisterRequest, LoginRequest } from "@shared/types";

const router = Router();
const prisma = getPrismaClient();

/**
 * POST /api/auth/register
 * Register a new user (customer or painter)
 */
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, userType, postcode }: RegisterRequest = req.body;

    // Validation
    if (!email || !password || !userType) {
      res.status(400).json({
        success: false,
        error: "Email, password, and userType are required",
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
      return;
    }

    if (userType !== "customer" && userType !== "painter") {
      res.status(400).json({
        success: false,
        error: "userType must be 'customer' or 'painter'",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "Email already in use",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        userType,
      },
    });

    // Create profile based on user type
    if (userType === "customer") {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (userType === "painter") {
      await prisma.painterProfile.create({
        data: {
          userId: user.id,
          postcode: postcode || "", // Can be provided at registration or during onboarding
        },
      });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      userType: user.userType as "customer" | "painter",
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType as "customer" | "painter",
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        customerProfile: true,
        painterProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      userType: user.userType as "customer" | "painter",
    });

    const response: AuthResponse = {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType as "customer" | "painter",
        customerProfile: user.customerProfile || undefined,
        painterProfile: user.painterProfile || undefined,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        customerProfile: true,
        painterProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const response = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType as "customer" | "painter",
          customerProfile: user.customerProfile || undefined,
          painterProfile: user.painterProfile || undefined,
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

export default router;
