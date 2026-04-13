-- ============================================================
-- PaintBookCo — Job matching RPC and database webhook trigger
-- Migration: 20260412000008_job_matching_webhook
-- ============================================================
-- Depends on: all prior migrations
--
-- BEFORE running this migration, store the service role key
-- in Supabase Vault:
--   INSERT INTO vault.secrets (name, secret)
--   VALUES ('SERVICE_ROLE_KEY', '<your-service-role-key>');
-- ============================================================

-- Enable pg_net for HTTP calls from Postgres triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── match_painters_for_job() RPC ──────────────────────────────
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
--   • location set
--   • Within own service_radius_km of the job
--   • Specialism matches job type
--   • Available on job start_date
--   • No currently disputed jobs

CREATE OR REPLACE FUNCTION match_painters_for_job(
  p_job_location geography,
  p_job_type     text,
  p_start_date   date,
  p_job_id       uuid
)
RETURNS TABLE (
  id                  uuid,
  first_name          text,
  last_name           text,
  email               text,
  avg_rating          numeric,
  completed_jobs      integer,
  response_time_hours numeric,
  distance_km         numeric
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
    p.kyc_status    = 'approved'
    AND p.is_active = true
    AND p.location  IS NOT NULL
    AND ST_DWithin(
          p.location::geography,
          p_job_location,
          p.service_radius_km * 1000   -- km → metres
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
    p.avg_rating          DESC,
    p.completed_jobs      DESC,
    p.response_time_hours ASC
  LIMIT 5;
$$;

COMMENT ON FUNCTION match_painters_for_job IS
  'Returns up to 5 eligible nearby painters for a job. '
  'Called by the match-job-to-painters Edge Function. '
  'Requires PostGIS (migration 20260412000001).';

-- ── trigger_job_matching() ────────────────────────────────────
-- Fires the match-job-to-painters Edge Function via pg_net
-- whenever a new job is inserted with status = pending_match.

CREATE OR REPLACE FUNCTION trigger_job_matching()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'pending_match' THEN
    PERFORM
      net.http_post(
        url     := 'https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/match-job-to-painters',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer '
                            || (SELECT decrypted_secret
                                FROM   vault.decrypted_secrets
                                WHERE  name = 'SERVICE_ROLE_KEY')
        ),
        body    := jsonb_build_object('job_id', NEW.id)
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION trigger_job_matching IS
  'Fires the match-job-to-painters Edge Function via pg_net '
  'on every INSERT into jobs where status = pending_match. '
  'Reads SERVICE_ROLE_KEY from Supabase Vault.';

-- ── Attach trigger ────────────────────────────────────────────

DROP TRIGGER IF EXISTS on_job_inserted ON jobs;

CREATE TRIGGER on_job_inserted
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_job_matching();
