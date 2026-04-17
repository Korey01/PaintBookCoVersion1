CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.sessions(id),
  transpact_transaction_id text UNIQUE,
  customer_email text NOT NULL,
  customer_first_name text NOT NULL,
  customer_last_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  customer_postcode text NOT NULL,
  painter_id uuid REFERENCES public.painters(id),
  job_summary text,
  chat_channel_id text,
  invoice_id text,
  invoice_html text,
  amount numeric NOT NULL,
  commission_rate numeric DEFAULT 12,
  commission_amount numeric,
  painter_payout numeric,
  customer_token text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending','invoice_sent','funded',
      'in_progress','completion_requested',
      'completed','disputed','cancelled','refunded'
    )),
  invoice_sent_at timestamptz,
  funded_at timestamptz,
  contact_shared_at timestamptz,
  completion_requested_at timestamptz,
  completed_at timestamptz,
  disputed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "painters_view_own_transactions"
  ON public.transactions FOR SELECT
  USING (
    painter_id IN (
      SELECT id FROM public.painters
      WHERE user_id = auth.uid()
    )
  );

CREATE INDEX transactions_painter_id_idx ON public.transactions (painter_id);
CREATE INDEX transactions_session_id_idx ON public.transactions (session_id);
CREATE INDEX transactions_status_idx ON public.transactions (status);
CREATE INDEX transactions_transpact_id_idx ON public.transactions (transpact_transaction_id);
