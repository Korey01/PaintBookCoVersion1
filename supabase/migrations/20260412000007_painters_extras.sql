-- ============================================================
-- PaintBookCo — Extra painter columns
-- Migration: 20260412000007_painters_extras
-- ============================================================
-- Depends on: 20260412000002_painters
-- ============================================================

-- Average hours between job notification and painter response.
-- Used as a tiebreaker in the match_painters_for_job() ranking.
-- Updated each time a painter accepts or declines a job match.
ALTER TABLE painters
  ADD COLUMN IF NOT EXISTS response_time_hours numeric NOT NULL DEFAULT 24;
