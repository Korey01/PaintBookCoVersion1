-- ============================================================
-- PaintBookCo — Add geographic location columns
-- Migration: 20260412000003_add_location_columns
-- ============================================================

-- Painters: PostGIS Point for service-area matching
ALTER TABLE painters
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Jobs: PostGIS Point for proximity matching
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- GIST spatial indexes for fast ST_DWithin queries
CREATE INDEX IF NOT EXISTS painters_location_idx
  ON painters USING GIST(location);

CREATE INDEX IF NOT EXISTS jobs_location_idx
  ON jobs USING GIST(location);
