CREATE TABLE IF NOT EXISTS pii_violations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id text,
  sender_id uuid,
  sender_role text,
  sender_email text,
  blocked_content text,
  detection_layer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pii_violations_job_id ON pii_violations(job_id);
CREATE INDEX IF NOT EXISTS idx_pii_violations_sender_id ON pii_violations(sender_id);
