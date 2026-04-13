-- ============================================================
-- PaintBookCo — Add response_time_hours to painters
-- Migration: 20260412000004_painters_response_time
-- ============================================================

-- Tracks average hours between job notification and acceptance/decline.
-- Used as a tiebreaker in the matching engine ranking query.
-- Updated automatically each time a painter responds to a job match.

ALTER TABLE painters
ADD COLUMN IF NOT EXISTS response_time_hours numeric NOT NULL DEFAULT 24;
