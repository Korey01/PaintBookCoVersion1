import { createServer as createHTTPServer } from "http";
import { createServer } from "./index";
import { initializeWebSocket } from "./websocket";

const app = createServer();
const port = process.env.PORT || 3000;

// Create HTTP server with Express app
const httpServer = createHTTPServer(app);

// Initialize WebSocket with Socket.io
const io = initializeWebSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`🚀 Backend API server running on port ${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api`);
  console.log(`🔌 WebSocket enabled for real-time notifications`);
  console.log(`✅ Database connected to Supabase`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  io.close();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  io.close();
  process.exit(0);
});
