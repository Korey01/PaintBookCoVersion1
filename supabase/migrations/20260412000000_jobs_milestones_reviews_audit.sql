-- ============================================================
-- PaintBookCo — Jobs, Milestones, Reviews & Audit Log
-- Migration: 20260412000000_jobs_milestones_reviews_audit
-- ============================================================

-- ── Jobs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id             uuid        REFERENCES auth.users(id),
  painter_id              uuid        REFERENCES painters(id) NULL,
  title                   text        NOT NULL,
  type                    text        NOT NULL,
  description             text,
  property_address        text,
  start_date              date,
  end_date                date,
  budget                  numeric,
  total_price             numeric,
  status                  text        NOT NULL DEFAULT 'pending_match',
  materials_arrangement   text,
  escrow_funded           boolean     NOT NULL DEFAULT false,
  transpact_transaction_id text,
  vestimator_estimate     numeric,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Job Milestones ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_milestones (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id               uuid        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  milestone_number     integer     NOT NULL,
  name                 text        NOT NULL,
  description          text,
  amount               numeric     NOT NULL,
  status               text        NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','submitted','approved','paid','disputed')),
  submitted_at         timestamptz,
  approved_at          timestamptz,
  paid_at              timestamptz,
  painter_notes        text,
  customer_notes       text,
  transpact_release_id text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

-- ── Reviews ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      uuid        REFERENCES jobs(id),
  customer_id uuid        REFERENCES auth.users(id),
  painter_id  uuid        REFERENCES painters(id),
  rating      integer     CHECK (rating BETWEEN 1 AND 5),
  review_text text        CHECK (char_length(review_text) >= 20),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Audit Log (immutable) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  action      text        NOT NULL,
  actor_id    uuid,
  actor_role  text,
  entity_type text,
  entity_id   uuid,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────

-- Jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own_jobs" ON jobs;
CREATE POLICY "customers_own_jobs" ON jobs
  FOR ALL USING (customer_id = auth.uid());

-- Job milestones
ALTER TABLE job_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_view_own_milestones" ON job_milestones;
CREATE POLICY "customers_view_own_milestones" ON job_milestones
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "customers_approve_milestones" ON job_milestones;
CREATE POLICY "customers_approve_milestones" ON job_milestones
  FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE customer_id = auth.uid()
    )
  )
  WITH CHECK (status IN ('approved', 'pending'));

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own_reviews" ON reviews;
CREATE POLICY "customers_own_reviews" ON reviews
  FOR ALL USING (customer_id = auth.uid());

-- Audit log (insert only, never update or delete)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_only_audit" ON audit_log;
CREATE POLICY "insert_only_audit" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS jobs_customer_id_idx     ON jobs (customer_id);
CREATE INDEX IF NOT EXISTS jobs_status_idx          ON jobs (status);
CREATE INDEX IF NOT EXISTS milestones_job_id_idx    ON job_milestones (job_id);
CREATE INDEX IF NOT EXISTS reviews_job_id_idx       ON reviews (job_id);
CREATE INDEX IF NOT EXISTS audit_log_entity_id_idx  ON audit_log (entity_id);
