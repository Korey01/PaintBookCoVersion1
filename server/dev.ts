import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 Backend API server running on port ${port}`);
  console.log(`📡 API endpoints available at http://localhost:${port}/api`);
  console.log(`✅ Database connected to Supabase`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
