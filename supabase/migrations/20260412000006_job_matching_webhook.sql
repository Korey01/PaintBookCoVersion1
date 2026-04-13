-- ============================================================
-- PaintBookCo — Database trigger to fire job matching
-- Migration: 20260412000005_job_matching_webhook
-- ============================================================
--
-- The pg_net extension must be enabled:
--   CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- The SERVICE_ROLE_KEY secret must be stored in Supabase Vault:
--   INSERT INTO vault.secrets (name, secret)
--   VALUES ('SERVICE_ROLE_KEY', '<your-service-role-key>');
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
        url     := 'https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/match-job-to-painters',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer '
                            || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SERVICE_ROLE_KEY')
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
  'The Edge Function URL is hardcoded to the kvuidnkmxqftbmlyvlyl project. '
  'Requires SERVICE_ROLE_KEY to be stored in Supabase Vault.';
