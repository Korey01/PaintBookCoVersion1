-- ============================================================
-- PaintBookCo — Geographic location columns
-- Migration: 20260412000006_location_columns
-- ============================================================
-- Depends on: 20260412000001_enable_extensions (PostGIS),
--             20260412000002_painters,
--             20260412000003_jobs
-- ============================================================

-- Painters: PostGIS Point used by ST_DWithin proximity matching
ALTER TABLE painters
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Jobs: PostGIS Point used by match_painters_for_job() RPC
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- GIST spatial indexes for fast ST_DWithin queries
CREATE INDEX IF NOT EXISTS painters_location_idx
  ON painters USING GIST (location);

CREATE INDEX IF NOT EXISTS jobs_location_idx
  ON jobs USING GIST (location);
