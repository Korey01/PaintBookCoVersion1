-- ============================================================
-- PaintBookCo — Database trigger to fire job matching
-- Migration: 20260412000005_job_matching_webhook
-- ============================================================
--
-- SETUP REQUIRED before running this migration:
--
-- Run the following in the Supabase SQL editor to set the
-- database configuration variables that the trigger reads:
--
--   ALTER DATABASE postgres
--     SET app.edge_function_url = 'https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1';
--
--   ALTER DATABASE postgres
--     SET app.service_role_key = '<your-service-role-key>';
--
-- The service role key is available in:
--   Supabase Dashboard → Settings → API → service_role (secret)
--
-- The pg_net extension must also be enabled:
--   CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- ============================================================

-- Enable pg_net for HTTP calls from within Postgres triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ── Matching trigger function ─────────────────────────────────

CREATE OR REPLACE FUNCTION trigger_job_matching()
RETURNS trigger AS $$
BEGIN
  -- Only fire when a new job is inserted with pending_match status
  IF NEW.status = 'pending_match' THEN
    PERFORM
      net.http_post(
        url     := current_setting('app.edge_function_url')
                    || '/match-job-to-painters',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer '
                            || current_setting('app.service_role_key')
        ),
        body    := jsonb_build_object('job_id', NEW.id)
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Attach trigger to jobs table ──────────────────────────────

DROP TRIGGER IF EXISTS on_job_inserted ON jobs;

CREATE TRIGGER on_job_inserted
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_job_matching();

-- ── Comment ───────────────────────────────────────────────────
COMMENT ON FUNCTION trigger_job_matching() IS
  'Fires the match-job-to-painters Edge Function via pg_net '
  'whenever a new job row is inserted with status=pending_match. '
  'Requires app.edge_function_url and app.service_role_key to be '
  'set as database-level GUC variables. See migration header for setup.';
