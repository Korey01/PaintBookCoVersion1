CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES public.transactions(id),
  session_id uuid REFERENCES public.sessions(id),
  raised_by text NOT NULL CHECK (raised_by IN ('customer', 'painter')),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved')),
  resolution_notes text,
  resolved_by text,
  resolved_at timestamptz,
  admin_customer_channel_id text,
  admin_painter_channel_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON public.disputes USING (true);
