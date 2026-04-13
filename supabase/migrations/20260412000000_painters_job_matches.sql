-- ============================================================
-- PaintBookCo — Painters & Job Matches
-- Migration: 20260412000001_painters_job_matches
-- ============================================================

-- ── Painters ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS painters (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        REFERENCES auth.users(id) UNIQUE,
  first_name            text,
  last_name             text,
  email                 text,
  phone                 text,
  address               text,
  kyc_status            text        NOT NULL DEFAULT 'pending'
    CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  kyc_rejection_reason  text,
  avg_rating            numeric     NOT NULL DEFAULT 0,
  completed_jobs        integer     NOT NULL DEFAULT 0,
  specialisms           text[]      NOT NULL DEFAULT '{}',
  service_radius_km     integer     NOT NULL DEFAULT 10,
  available_from        date,
  available_to          date,
  transpact_seller_id   text,
  is_active             boolean     NOT NULL DEFAULT false,
  location              geography(Point, 4326),
  bio                   text,
  insurance_expiry      date,
  insurance_insurer     text,
  insurance_policy_no   text,
  bank_account_holder   text,
  bank_sort_code        text,
  bank_account_number   text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS painters_updated_at ON painters;
CREATE TRIGGER painters_updated_at
  BEFORE UPDATE ON painters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Job Matches ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_matches (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       uuid        REFERENCES jobs(id),
  painter_id   uuid        REFERENCES painters(id),
  status       text        NOT NULL DEFAULT 'notified'
    CHECK (status IN ('notified','accepted','declined','declined_auto')),
  notified_at  timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- ── Add assigned_painter_id to jobs if not present ────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'assigned_painter_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN assigned_painter_id uuid REFERENCES painters(id) NULL;
  END IF;
END
$$;

-- ── Row Level Security ────────────────────────────────────────

-- Painters: each painter owns their record
ALTER TABLE painters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "painters_own_record" ON painters;
CREATE POLICY "painters_own_record" ON painters
  FOR ALL USING (user_id = auth.uid());

-- Job matches: painters see and update their own matches
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "painters_own_matches" ON job_matches;
CREATE POLICY "painters_own_matches" ON job_matches
  FOR SELECT USING (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "painters_update_own_matches" ON job_matches;
CREATE POLICY "painters_update_own_matches" ON job_matches
  FOR UPDATE USING (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );

-- Job milestones: painters see milestones for assigned jobs
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

DROP POLICY IF EXISTS "painters_submit_milestones" ON job_milestones;
CREATE POLICY "painters_submit_milestones" ON job_milestones
  FOR UPDATE USING (
    job_id IN (
      SELECT id FROM jobs
      WHERE assigned_painter_id IN (
        SELECT id FROM painters WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (status = 'submitted');

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS painters_user_id_idx        ON painters (user_id);
CREATE INDEX IF NOT EXISTS painters_kyc_status_idx     ON painters (kyc_status);
CREATE INDEX IF NOT EXISTS job_matches_job_id_idx      ON job_matches (job_id);
CREATE INDEX IF NOT EXISTS job_matches_painter_id_idx  ON job_matches (painter_id);
CREATE INDEX IF NOT EXISTS job_matches_status_idx      ON job_matches (status);
CREATE INDEX IF NOT EXISTS jobs_assigned_painter_idx   ON jobs (assigned_painter_id);
