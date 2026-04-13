CREATE TABLE IF NOT EXISTS job_matches (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       uuid        REFERENCES jobs(id),
  painter_id   uuid        REFERENCES painters(id),
  status       text        NOT NULL DEFAULT 'notified'
    CHECK (status IN ('notified','accepted','declined','declined_auto')),
  notified_at  timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "painters_own_matches" ON job_matches
  FOR SELECT USING (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "painters_update_own_matches"
  ON job_matches FOR UPDATE
  USING (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );
