import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// ── Type definitions ──────────────────────────────────────────────────────────

export type JobStatus =
  | "pending_match"
  | "matching_in_progress"
  | "painter_accepted"
  | "awaiting_payment"
  | "escrow_funded"
  | "in_progress"
  | "milestone_review"
  | "pending_completion"
  | "completed"
  | "disputed"
  | "cancelled";

export type MaterialsArrangement =
  | "customer_provides"
  | "painter_purchases"
  | "platform";

export type MilestoneStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "paid"
  | "disputed";

export interface Job {
  id: string;
  customer_id: string;
  painter_id: string | null;
  title: string;
  type: string;
  description: string | null;
  property_address: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  total_price: number | null;
  status: JobStatus;
  materials_arrangement: MaterialsArrangement | null;
  escrow_funded: boolean;
  transpact_transaction_id: string | null;
  vestimator_estimate: number | null;
  created_at: string;
  updated_at: string;
  // joined
  painter_name?: string | null;
}

export interface JobMilestone {
  id: string;
  job_id: string;
  milestone_number: number;
  name: string;
  description: string | null;
  amount: number;
  status: MilestoneStatus;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  painter_notes: string | null;
  customer_notes: string | null;
  transpact_release_id: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  customer_id: string;
  painter_id: string | null;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actor_id: string | null;
  actor_role: string | null;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}
