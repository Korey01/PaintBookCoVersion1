ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS customer_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS sessions_customer_token_idx 
  ON public.sessions (customer_token);
