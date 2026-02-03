import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import jobsRoutes from "./routes/jobs";
import quotesRoutes from "./routes/quotes";
import paymentsRoutes from "./routes/payments";
import kycRoutes from "./routes/kyc";
import twoFARoutes from "./routes/2fa";
import notificationsRoutes from "./routes/notifications";
import adminRoutes from "./routes/admin";
import disputesRoutes from "./routes/disputes";
import paintersRoutes from "./routes/painters";
import messagesRoutes from "./routes/messages";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ message: ping });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobsRoutes);
  app.use("/api/quotes", quotesRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/kyc", kycRoutes);
  app.use("/api/2fa", twoFARoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/disputes", disputesRoutes);
  app.use("/api/painters", paintersRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "Not found",
    });
  });

  return app;
}
