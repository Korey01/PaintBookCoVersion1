-- ============================================================
-- PaintBookCo — Painters
-- Migration: 20260412000001_painters
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Painters ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS painters (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        REFERENCES auth.users(id) UNIQUE,
  first_name            text,
  last_name             text,
  email                 text,
  phone                 text,
  address               text,
  kyc_status            text        NOT NULL DEFAULT 'pending'
    CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  kyc_rejection_reason  text,
  avg_rating            numeric     NOT NULL DEFAULT 0,
  completed_jobs        integer     NOT NULL DEFAULT 0,
  specialisms           text[]      NOT NULL DEFAULT '{}',
  service_radius_km     integer     NOT NULL DEFAULT 10,
  available_from        date,
  available_to          date,
  transpact_seller_id   text,
  is_active             boolean     NOT NULL DEFAULT false,
  location              geography(Point, 4326),
  bio                   text,
  insurance_expiry      date,
  insurance_insurer     text,
  insurance_policy_no   text,
  bank_account_holder   text,
  bank_sort_code        text,
  bank_account_number   text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS painters_updated_at ON painters;
CREATE TRIGGER painters_updated_at
  BEFORE UPDATE ON painters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE painters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "painters_own_record" ON painters;
CREATE POLICY "painters_own_record" ON painters
  FOR ALL USING (user_id = auth.uid());

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS painters_user_id_idx    ON painters (user_id);
CREATE INDEX IF NOT EXISTS painters_kyc_status_idx ON painters (kyc_status);
