-- ============================================================
-- PaintBookCo — Job matches table
-- Migration: 20260412000004_job_matches
-- ============================================================
-- Depends on: 20260412000002_painters, 20260412000003_jobs
-- Both FK targets must exist before this migration runs.
-- ============================================================

CREATE TABLE IF NOT EXISTS job_matches (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       uuid        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  painter_id   uuid        NOT NULL REFERENCES painters(id),
  status       text        NOT NULL DEFAULT 'notified'
    CHECK (status IN ('notified','accepted','declined','declined_auto')),
  notified_at  timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- ── Row Level Security ────────────────────────────────────────

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

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS job_matches_job_id_idx     ON job_matches (job_id);
CREATE INDEX IF NOT EXISTS job_matches_painter_id_idx ON job_matches (painter_id);
CREATE INDEX IF NOT EXISTS job_matches_status_idx     ON job_matches (status);
