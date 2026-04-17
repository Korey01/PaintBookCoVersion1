/**
 * API Client — Connect frontend to existing Supabase Edge Functions
 *
 * Base URL: https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/
 *
 * All calls require:
 * - apikey: [anon key from env]
 * - Authorization: Bearer [user JWT from Supabase Auth]
 * - Content-Type: application/json
 */

import { supabase } from "./supabase";

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// ── Helper: Call Edge Function ────────────────────────────────────────────

async function callFunction<T = any>(
  functionName: string,
  payload: Record<string, any> = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return { data: null, error: "Not authenticated" };
    }

    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    const response = await fetch(
      `${FUNCTIONS_BASE}/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return { data: null, error: `${response.status}: ${text}` };
    }

    const result = await response.json();
    return { data: result, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Job Matching ──────────────────────────────────────────────────────────

export async function matchJobToPainters(jobId: string): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("match-job-to-painters", { job_id: jobId });
  return { success: !!data, error };
}

// ── Job Management ────────────────────────────────────────────────────────

export async function acceptJob(jobId: string): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("accept-job", { job_id: jobId });
  return { success: !!data, error };
}

// ── Milestone Management ──────────────────────────────────────────────────

export async function submitMilestone(
  milestoneId: string,
  painterNotes: string
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("submit-milestone", {
    milestone_id: milestoneId,
    painter_notes: painterNotes,
  });
  return { success: !!data, error };
}

export async function approveMilestone(
  milestoneId: string,
  customerNotes?: string
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("approve-milestone", {
    milestone_id: milestoneId,
    customer_notes: customerNotes,
  });
  return { success: !!data, error };
}

export async function requestMilestoneChanges(
  milestoneId: string,
  notes: string
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("request-milestone-changes", {
    milestone_id: milestoneId,
    customer_notes: notes,
  });
  return { success: !!data, error };
}

export async function releaseMilestonePayment(
  milestoneId: string
): Promise<{ transactionId: string | null; error: string | null }> {
  const { data, error } = await callFunction("release-milestone-payment", {
    milestone_id: milestoneId,
  });
  return { transactionId: data?.transaction_id, error };
}

// ── Escrow Management (Transpact) ─────────────────────────────────────────

export async function createTranspactAccount(
  jobId: string,
  amount: number,
  customerEmail: string,
  painterEmail: string
): Promise<{ accountId: string | null; error: string | null }> {
  const { data, error } = await callFunction("create-transpact", {
    job_id: jobId,
    amount,
    customer_email: customerEmail,
    painter_email: painterEmail,
  });
  return { accountId: data?.account_id, error };
}

export async function getTranspactStatus(
  accountId: string
): Promise<{ status: string | null; error: string | null }> {
  const { data, error } = await callFunction("get-transpact-status", {
    account_id: accountId,
  });
  return { status: data?.status, error };
}

export async function voidTranspact(
  accountId: string,
  reason: string
): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("void-transpact", {
    account_id: accountId,
    reason,
  });
  return { success: !!data, error };
}

// ── Reviews ───────────────────────────────────────────────────────────────

export async function submitReview(
  jobId: string,
  rating: number,
  reviewText: string
): Promise<{ reviewId: string | null; error: string | null }> {
  const { data, error } = await callFunction("submit-review", {
    job_id: jobId,
    rating,
    review_text: reviewText,
  });
  return { reviewId: data?.review_id, error };
}

// ── Account Management ────────────────────────────────────────────────────

export async function downloadMyData(): Promise<{ csvUrl: string | null; error: string | null }> {
  const { data, error } = await callFunction("download-my-data");
  return { csvUrl: data?.csv_url, error };
}

export async function deleteMyAccount(reason: string): Promise<{ success: boolean; error: string | null }> {
  const { data, error } = await callFunction("delete-my-account", { reason });
  return { success: !!data, error };
}

// ── Chat (Stream) ─────────────────────────────────────────────────────────

export async function generateStreamToken(): Promise<{ token: string | null; error: string | null }> {
  const { data, error } = await callFunction("generate-stream-token");
  return { token: data?.token, error };
}

// ── Message Filtering ─────────────────────────────────────────────────────

export async function filterMessage(message: string): Promise<{ filtered: boolean; error: string | null }> {
  const { data, error } = await callFunction("filter-message", { message });
  return { filtered: data?.filtered || false, error };
}

// ── Webhook Receiver (Transpact) ──────────────────────────────────────────
// Note: This is for handling incoming webhooks from Transpact
// URL: POST https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/transpact-webhook-receiver

export async function handleTranspactWebhook(payload: Record<string, any>): Promise<void> {
  // This is called automatically by Transpact webhook
  // No need to call from frontend
  // Transpact webhooks are handled server-side; no client-side action needed
}

// ── Helper: Direct Supabase Queries ───────────────────────────────────────

export async function getJob(jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  return { data, error: error?.message };
}

export async function getJobs(customerId?: string, painterId?: string) {
  let query = supabase.from("jobs").select("*");

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }
  if (painterId) {
    query = query.eq("painter_id", painterId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getMilestones(jobId: string) {
  const { data, error } = await supabase
    .from("job_milestones")
    .select("*")
    .eq("job_id", jobId)
    .order("milestone_number");

  return { data, error: error?.message };
}

export async function getJobMatches(painterId: string) {
  const { data, error } = await supabase
    .from("job_matches")
    .select("*, jobs(*)")
    .eq("painter_id", painterId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message };
}

export async function getReviews(jobId?: string, painterId?: string) {
  let query = supabase.from("reviews").select("*");

  if (jobId) {
    query = query.eq("job_id", jobId);
  }
  if (painterId) {
    query = query.eq("painter_id", painterId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error: error?.message };
}

export async function getAuditLog(entityId: string) {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false });

  return { data, error: error?.message };
}

export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  return { data, error: error?.message };
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Record<string, any>
) {
  const { data, error } = await supabase
    .from("notification_preferences")
    .update(preferences)
    .eq("user_id", userId);

  return { data, error: error?.message };
}
