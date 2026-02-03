import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }
  return prisma;
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

// Re-export Prisma types for convenience
export type {
  User,
  Job,
  Quote,
  EscrowTransaction,
  Dispute,
  PainterProfile,
  CustomerProfile,
} from "@prisma/client";
