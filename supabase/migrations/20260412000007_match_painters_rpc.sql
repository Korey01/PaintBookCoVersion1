-- ============================================================
-- PaintBookCo — match_painters_for_job RPC function
-- Migration: 20260412000006_match_painters_rpc
-- ============================================================
-- Called by the match-job-to-painters Edge Function via
-- supabase.rpc('match_painters_for_job', { ... })
--
-- Returns up to 5 eligible painters ranked by:
--   1. avg_rating DESC
--   2. completed_jobs DESC
--   3. response_time_hours ASC
--
-- Eligibility criteria:
--   • kyc_status = 'approved'
--   • is_active = true
--   • Within service radius (PostGIS ST_DWithin)
--   • Specialism matches job type
--   • Available on job start date
--   • No open disputed jobs
-- ============================================================

CREATE OR REPLACE FUNCTION match_painters_for_job(
  p_job_location  geography,
  p_job_type      text,
  p_start_date    date,
  p_job_id        uuid
)
RETURNS TABLE (
  id                   uuid,
  first_name           text,
  last_name            text,
  email                text,
  avg_rating           numeric,
  completed_jobs       integer,
  response_time_hours  numeric,
  distance_km          numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.avg_rating,
    p.completed_jobs,
    p.response_time_hours,
    ROUND(
      (ST_Distance(p.location::geography, p_job_location) / 1000.0)::numeric,
      2
    ) AS distance_km
  FROM painters p
  WHERE
    p.kyc_status     = 'approved'
    AND p.is_active  = true
    AND p.location   IS NOT NULL
    AND ST_DWithin(
          p.location::geography,
          p_job_location,
          p.service_radius_km * 1000   -- convert km → metres
        )
    AND p_job_type = ANY(p.specialisms)
    AND p.available_from IS NOT NULL
    AND p.available_to   IS NOT NULL
    AND p.available_from <= p_start_date
    AND p.available_to   >= p_start_date
    AND p.id NOT IN (
          SELECT DISTINCT j.assigned_painter_id
          FROM   jobs j
          WHERE  j.status = 'disputed'
          AND    j.assigned_painter_id IS NOT NULL
        )
  ORDER BY
    p.avg_rating           DESC,
    p.completed_jobs       DESC,
    p.response_time_hours  ASC
  LIMIT 5;
$$;

COMMENT ON FUNCTION match_painters_for_job IS
  'Returns up to 5 eligible, nearby painters for a given job. '
  'Called by the match-job-to-painters Edge Function. '
  'Requires PostGIS (migration 20260412000002).';
