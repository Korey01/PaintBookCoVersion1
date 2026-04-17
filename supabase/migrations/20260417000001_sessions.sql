CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  postcode text,
  city text,
  job_type text,
  job_description text,
  has_structural_defects boolean DEFAULT false,
  structural_defect_details text,
  rooms jsonb DEFAULT '[]',
  paint_choice text,
  vestimator_data jsonb,
  estimated_cost numeric,
  location geography(Point, 4326),
  converted_to_transaction boolean DEFAULT false,
  transaction_id uuid,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  landing_page text,
  pages_visited text[] DEFAULT '{}',
  time_spent_seconds integer DEFAULT 0,
  form_step_reached integer DEFAULT 0,
  form_abandoned_at_step integer,
  device_type text,
  browser text,
  screen_resolution text,
  colour_preferences jsonb DEFAULT '{}',
  paint_brand_preferences text[] DEFAULT '{}',
  finish_preferences text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'browsing'
    CHECK (status IN (
      'browsing','job_posted','painter_contacted',
      'invoice_sent','paid','completed','abandoned'
    )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_insert_anon" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "sessions_select_service" ON public.sessions
  FOR SELECT USING (false);

CREATE INDEX sessions_email_idx ON public.sessions (email);
CREATE INDEX sessions_postcode_idx ON public.sessions (postcode);
CREATE INDEX sessions_status_idx ON public.sessions (status);
CREATE INDEX sessions_created_at_idx ON public.sessions (created_at);
