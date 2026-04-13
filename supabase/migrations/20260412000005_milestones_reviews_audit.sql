-- ============================================================
-- PaintBookCo — Job milestones, reviews, and audit log
-- Migration: 20260412000005_milestones_reviews_audit
-- ============================================================
-- Depends on: 20260412000003_jobs, 20260412000002_painters
-- ============================================================

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

-- ── Audit Log ─────────────────────────────────────────────────

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

-- ── Row Level Security — Milestones ───────────────────────────

ALTER TABLE job_milestones ENABLE ROW LEVEL SECURITY;

-- Customers can view milestones for their own jobs
DROP POLICY IF EXISTS "customers_view_own_milestones" ON job_milestones;
CREATE POLICY "customers_view_own_milestones" ON job_milestones
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE customer_id = auth.uid())
  );

-- Customers can approve or request changes on milestones
DROP POLICY IF EXISTS "customers_update_milestones" ON job_milestones;
CREATE POLICY "customers_update_milestones" ON job_milestones
  FOR UPDATE
  USING (
    job_id IN (SELECT id FROM jobs WHERE customer_id = auth.uid())
  )
  WITH CHECK (status IN ('approved','pending'));

-- Painters can view milestones for their assigned jobs
DROP POLICY IF EXISTS "painters_view_own_milestones" ON job_milestones;
CREATE POLICY "painters_view_own_milestones" ON job_milestones
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE assigned_painter_id IN (
        SELECT id FROM painters WHERE user_id = auth.uid()
      )
    )
  );

-- Painters can submit milestones for their assigned jobs
DROP POLICY IF EXISTS "painters_submit_milestones" ON job_milestones;
CREATE POLICY "painters_submit_milestones" ON job_milestones
  FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE assigned_painter_id IN (
        SELECT id FROM painters WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (status = 'submitted');

-- ── Row Level Security — Reviews ──────────────────────────────

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_own_reviews" ON reviews;
CREATE POLICY "customers_own_reviews" ON reviews
  FOR ALL USING (customer_id = auth.uid());

-- ── Row Level Security — Audit Log ────────────────────────────

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Insert only — no reads or deletes from client
DROP POLICY IF EXISTS "insert_only_audit" ON audit_log;
CREATE POLICY "insert_only_audit" ON audit_log
  FOR INSERT WITH CHECK (true);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS milestones_job_id_idx   ON job_milestones (job_id);
CREATE INDEX IF NOT EXISTS milestones_status_idx   ON job_milestones (status);
CREATE INDEX IF NOT EXISTS reviews_job_id_idx      ON reviews (job_id);
CREATE INDEX IF NOT EXISTS reviews_painter_id_idx  ON reviews (painter_id);
CREATE INDEX IF NOT EXISTS audit_log_entity_id_idx ON audit_log (entity_id);
