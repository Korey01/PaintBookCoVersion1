/**
 * Payment Service — Stripe + TransPact escrow integration
 *
 * Handles:
 * - Stripe payment processing
 * - TransPact escrow account setup
 * - Milestone-based payments
 * - Refund handling
 */

import { supabase } from "./supabase";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  created_at: string;
}

export interface EscrowAccount {
  id: string;
  customer_id: string;
  painter_id: string;
  job_id: string;
  amount: number;
  status: "pending" | "funded" | "held" | "released" | "disputed";
  transpact_account_id: string | null;
  transpact_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilestonePayment {
  id: string;
  milestone_id: string;
  amount: number;
  status: "pending" | "approved" | "paid" | "disputed";
  created_at: string;
}

// ── Stripe Payment Processing ──────────────────────────────────────────────

export async function createPaymentIntent(
  amount: number,
  jobId: string
): Promise<{ clientSecret: string | null; error: string | null }> {
  try {
    const response = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, jobId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { clientSecret: null, error };
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret, error: null };
  } catch (error) {
    return {
      clientSecret: null,
      error:
        error instanceof Error ? error.message : "Failed to create payment intent",
    };
  }
}

export async function confirmPayment(
  paymentIntentId: string,
  jobId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/payments/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, jobId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to confirm payment",
    };
  }
}

// ── Escrow Management (TransPact) ──────────────────────────────────────────

export async function createEscrowAccount(
  customerId: string,
  painterId: string,
  jobId: string,
  amount: number
): Promise<{ account: EscrowAccount | null; error: string | null }> {
  try {
    // Create escrow account in Supabase
    const { data, error } = await supabase.from("escrow_accounts").insert({
      customer_id: customerId,
      painter_id: painterId,
      job_id: jobId,
      amount,
      status: "pending",
    });

    if (error) {
      return { account: null, error: error.message };
    }

    // In production, this would also initialize TransPact account
    // POST to /api/escrow/setup-account
    // const transpactResponse = await fetch("/api/escrow/setup-account", { ... })

    return { account: data[0], error: null };
  } catch (error) {
    return {
      account: null,
      error:
        error instanceof Error ? error.message : "Failed to create escrow account",
    };
  }
}

export async function fundEscrowAccount(
  escrowAccountId: string,
  jobId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/escrow/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escrowAccountId, jobId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    // Update status in Supabase
    await supabase
      .from("escrow_accounts")
      .update({ status: "funded" })
      .eq("id", escrowAccountId);

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fund escrow account",
    };
  }
}

export async function releaseEscrowFunds(
  escrowAccountId: string,
  painterId: string,
  amount: number
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/escrow/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escrowAccountId, painterId, amount }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    // Update status in Supabase
    await supabase
      .from("escrow_accounts")
      .update({ status: "released" })
      .eq("id", escrowAccountId);

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to release escrow funds",
    };
  }
}

export async function holdEscrowFunds(
  escrowAccountId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/escrow/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escrowAccountId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    // Update status in Supabase
    await supabase
      .from("escrow_accounts")
      .update({ status: "held" })
      .eq("id", escrowAccountId);

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to hold escrow funds",
    };
  }
}

// ── Milestone Payments ─────────────────────────────────────────────────────

export async function approveMilestonePayment(
  milestoneId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/milestones/approve-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve milestone payment",
    };
  }
}

export async function releaseMilestonePayment(
  milestoneId: string,
  painterId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/milestones/release-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestoneId, painterId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to release milestone payment",
    };
  }
}

// ── Payment History ────────────────────────────────────────────────────────

export async function getPaymentHistory(
  userId: string
): Promise<{ payments: PaymentIntent[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("payment_intents")
      .select("*")
      .or(`customer_id.eq.${userId},painter_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      return { payments: null, error: error.message };
    }

    return { payments: (data as PaymentIntent[]) || [], error: null };
  } catch (error) {
    return {
      payments: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch payment history",
    };
  }
}

// ── Refund Handling ────────────────────────────────────────────────────────

export async function initiateRefund(
  paymentIntentId: string,
  reason: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/payments/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, reason }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to initiate refund",
    };
  }
}
