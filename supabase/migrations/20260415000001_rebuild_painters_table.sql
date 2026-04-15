DROP TABLE IF EXISTS public.painters CASCADE;

CREATE TABLE public.painters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  postcode text,
  city text,
  bio text CHECK (char_length(bio) <= 500),
  kyc_status text NOT NULL DEFAULT 'pending'
    CHECK (kyc_status IN ('pending','submitted','approved','rejected')),
  kyc_rejection_reason text,
  avg_rating numeric NOT NULL DEFAULT 0,
  completed_jobs integer NOT NULL DEFAULT 0,
  specialisms text[] NOT NULL DEFAULT '{}',
  service_radius_km integer NOT NULL DEFAULT 10,
  available_from date,
  available_to date,
  transpact_seller_id text,
  transpact_registered boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  insurance_verified boolean NOT NULL DEFAULT false,
  insurance_company text,
  insurance_policy_number text,
  insurance_policy_details text,
  insurance_certificate_url text,
  insurance_expiry_date date,
  insurance_submitted_at timestamptz,
  profile_complete boolean NOT NULL DEFAULT false,
  gallery_size_bytes bigint NOT NULL DEFAULT 0,
  location geography(Point, 4326),
  response_time_hours numeric DEFAULT 24,
  profile_photo_url text,
  portfolio_urls text[] DEFAULT '{}',
  terms_accepted boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamptz,
  privacy_accepted boolean NOT NULL DEFAULT false,
  bank_account_holder text,
  bank_sort_code text,
  bank_account_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS painters_updated_at ON painters;
CREATE TRIGGER painters_updated_at
  BEFORE UPDATE ON painters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE painters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "painters_own_record" ON painters
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "painters_public_profile" ON painters
  FOR SELECT
  USING (kyc_status = 'approved' AND is_active = true);

CREATE INDEX painters_location_idx ON painters USING GIST(location);
CREATE INDEX painters_postcode_idx ON painters (postcode);
CREATE INDEX painters_kyc_status_idx ON painters (kyc_status);
CREATE INDEX painters_specialisms_idx ON painters USING GIN(specialisms);
