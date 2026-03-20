import { getPrismaClient } from "@server/lib/db";

const prisma = getPrismaClient();

export interface ReputationMetrics {
  reliabilityScore: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  cancellationRate: number;
  averageRating?: number;
  tier: "starter" | "pro" | "premium";
}

/**
 * Calculate reliability score based on painter's ReliabilityEvents
 * Score ranges from 0 to 100
 */
export async function calculateReliabilityScore(
  painterId: string,
): Promise<number> {
  const painter = await prisma.painterProfile.findUnique({
    where: { id: painterId },
    include: {
      reliabilityEvents: true,
      jobs: {
        select: { status: true },
      },
    },
  });

  if (!painter) {
    return 0;
  }

  // Start with base score
  let score = 50;

  // Add points for positive events
  const events = painter.reliabilityEvents;
  for (const event of events) {
    score += event.value * 10; // Scale values
  }

  // Apply cancellation penalty
  if (painter.totalJobs > 0) {
    const cancellationRate = painter.cancellationRate;
    const cancellationPenalty = cancellationRate * 20; // Each 1% cancellation = 0.2 points off
    score -= cancellationPenalty;
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  return Math.round(score * 10) / 10;
}

/**
 * Record a reliability event for a painter
 */
export async function recordReliabilityEvent(
  painterId: string,
  eventType: string,
  value: number,
  reason?: string,
): Promise<void> {
  await prisma.reliabilityEvent.create({
    data: {
      painterId,
      eventType: eventType as any,
      value,
      reason: reason || undefined,
    },
  });

  // Update painter's overall reliability score
  const newScore = await calculateReliabilityScore(painterId);
  const painter = await prisma.painterProfile.findUnique({
    where: { id: painterId },
  });

  if (painter) {
    const totalJobs = painter.totalJobs || 0;

    // Query actual count of cancelled jobs
    const cancelledJobsCount = await prisma.job.count({
      where: {
        painterId,
        status: "cancelled",
      },
    });

    const newCancellationRate =
      totalJobs > 0 ? (cancelledJobsCount / totalJobs) * 100 : 0;

    await prisma.painterProfile.update({
      where: { id: painterId },
      data: {
        reliabilityScore: newScore,
        cancellationRate: newCancellationRate,
      },
    });
  }
}

/**
 * Get comprehensive reputation metrics for a painter
 */
export async function getPainterReputation(
  painterId: string,
): Promise<ReputationMetrics> {
  const painter = await prisma.painterProfile.findUnique({
    where: { id: painterId },
    include: {
      jobs: {
        select: {
          status: true,
          completion: {
            select: { approvedAt: true },
          },
        },
      },
      reliabilityEvents: true,
    },
  });

  if (!painter) {
    throw new Error("Painter not found");
  }

  const totalJobs = painter.totalJobs || 0;
  const completedJobs = painter.jobs.filter(
    (j) =>
      j.status === "approved" ||
      (j.status === "completed" && j.completion?.approvedAt),
  ).length;
  const cancelledJobs = painter.jobs.filter(
    (j) => j.status === "cancelled",
  ).length;
  const cancellationRate =
    totalJobs > 0 ? (cancelledJobs / totalJobs) * 100 : 0;

  // Determine tier based on reliability score
  const reliabilityScore = painter.reliabilityScore || 0;
  let tier: "starter" | "pro" | "premium" = "starter";
  if (reliabilityScore >= 75 && totalJobs >= 10) {
    tier = "pro";
  } else if (reliabilityScore >= 85 && totalJobs >= 25) {
    tier = "premium";
  }

  return {
    reliabilityScore,
    totalJobs,
    completedJobs,
    cancelledJobs,
    cancellationRate: Math.round(cancellationRate * 100) / 100,
    tier,
  };
}

/**
 * Determine commission tier based on job count
 * Jobs 1-5: 12%
 * Jobs 6-10: 10%
 * Jobs 11+: 8%
 */
export function getCommissionTier(jobCount: number): number {
  if (jobCount <= 5) return 12;
  if (jobCount <= 10) return 10;
  return 8;
}

/**
 * Update painter statistics after job completion
 */
export async function updatePainterStatistics(
  painterId: string,
  jobAmount: number,
): Promise<void> {
  const painter = await prisma.painterProfile.findUnique({
    where: { id: painterId },
  });

  if (!painter) {
    return;
  }

  const newTotalJobs = (painter.totalJobs || 0) + 1;
  const newTotalEarnings = (painter.totalEarnings || 0) + jobAmount;

  // Record positive event for job completion
  await recordReliabilityEvent(
    painterId,
    "job_completed",
    0.5,
    "Job successfully completed and approved",
  );

  // Update painter profile
  await prisma.painterProfile.update({
    where: { id: painterId },
    data: {
      totalJobs: newTotalJobs,
      totalEarnings: newTotalEarnings,
      currentCommissionTier: getCommissionTier(newTotalJobs),
    },
  });
}

/**
 * Handle painter cancellation - apply penalty
 */
export async function handlePainterCancellation(
  painterId: string,
  reason?: string,
): Promise<void> {
  const painter = await prisma.painterProfile.findUnique({
    where: { id: painterId },
  });

  if (!painter) {
    return;
  }

  // Record negative event
  await recordReliabilityEvent(
    painterId,
    "job_cancelled",
    -0.5,
    reason || "Job cancelled by painter",
  );

  // Update cancellation rate
  const totalJobs = painter.totalJobs || 0;
  let cancelledCount = 0;

  if (totalJobs > 0) {
    // Count actual cancelled jobs
    const cancelledJobs = await prisma.job.count({
      where: {
        painterId,
        status: "cancelled",
      },
    });
    cancelledCount = cancelledJobs;
  }

  const newCancellationRate =
    totalJobs > 0 ? (cancelledCount / totalJobs) * 100 : 0;

  await prisma.painterProfile.update({
    where: { id: painterId },
    data: {
      cancellationRate: newCancellationRate,
    },
  });
}
