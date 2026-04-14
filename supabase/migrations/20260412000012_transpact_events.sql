-- PaintBookCo — Transpact events log + painter registration flag
-- Migration: 20260412000012_transpact_events

CREATE TABLE IF NOT EXISTS transpact_events (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  transpact_number  integer     NOT NULL,
  event_id          integer     NOT NULL,
  amount            numeric,
  description       text,
  raw_payload       jsonb,
  job_id            uuid        REFERENCES jobs(id),
  processed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS transpact_events_dedup_idx
  ON transpact_events (transpact_number, event_id);

CREATE INDEX IF NOT EXISTS transpact_events_number_idx
  ON transpact_events (transpact_number);

ALTER TABLE transpact_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_only_transpact_events" ON transpact_events;
CREATE POLICY "admin_only_transpact_events"
  ON transpact_events FOR SELECT USING (false);

DROP POLICY IF EXISTS "insert_transpact_events" ON transpact_events;
CREATE POLICY "insert_transpact_events"
  ON transpact_events FOR INSERT WITH CHECK (true);

ALTER TABLE painters
  ADD COLUMN IF NOT EXISTS transpact_registered boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS jobs_transpact_tx_idx
  ON jobs (transpact_transaction_id)
  WHERE transpact_transaction_id IS NOT NULL;
