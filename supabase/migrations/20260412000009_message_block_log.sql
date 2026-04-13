-- ============================================================
-- PaintBookCo — Message block log
-- Migration: 20260412000009_message_block_log
-- ============================================================
-- Records every message blocked by Layer 1 (regex) or
-- Layer 2 (SightEngine AI) PII filters.
-- Admin-only read access; all Edge Functions can insert.
-- ============================================================

CREATE TABLE IF NOT EXISTS message_block_log (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id           uuid        REFERENCES jobs(id),
  sender_user_id   uuid        REFERENCES auth.users(id),
  sender_role      text,
  filter_triggered text,
  content_hash     text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE message_block_log ENABLE ROW LEVEL SECURITY;

-- No client-side reads — admin access only via service role
CREATE POLICY "admin_only_block_log" ON message_block_log
  FOR SELECT USING (false);

-- Edge Functions (service role) may insert
CREATE POLICY "insert_block_log" ON message_block_log
  FOR INSERT WITH CHECK (true);

-- Index for 24-hour violation window queries
CREATE INDEX IF NOT EXISTS block_log_sender_created_idx
  ON message_block_log (sender_user_id, created_at DESC);
