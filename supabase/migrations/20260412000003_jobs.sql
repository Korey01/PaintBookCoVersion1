-- ============================================================
-- PaintBookCo — Jobs table
-- Migration: 20260412000003_jobs
-- ============================================================
-- Depends on: 20260412000002_painters
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id              uuid        REFERENCES auth.users(id),
  assigned_painter_id      uuid        REFERENCES painters(id),
  title                    text        NOT NULL,
  type                     text        NOT NULL,
  description              text,
  property_address         text,
  start_date               date,
  end_date                 date,
  budget                   numeric,
  total_price              numeric,
  status                   text        NOT NULL DEFAULT 'pending_match',
  materials_arrangement    text,
  escrow_funded            boolean     NOT NULL DEFAULT false,
  transpact_transaction_id text,
  vestimator_estimate      numeric,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own_jobs" ON jobs;
CREATE POLICY "customers_own_jobs" ON jobs
  FOR ALL USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "painters_view_assigned_jobs" ON jobs;
CREATE POLICY "painters_view_assigned_jobs" ON jobs
  FOR SELECT USING (
    assigned_painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS jobs_customer_id_idx        ON jobs (customer_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx             ON jobs (status);
CREATE INDEX IF NOT EXISTS jobs_assigned_painter_idx   ON jobs (assigned_painter_id);
