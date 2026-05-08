-- BUG 4 FIX: sessions table is missing painter_id and chat_channel_id columns.
-- initiate-chat writes these columns after a painter contacts a customer, so they
-- must exist for the chat open flow to work in the painter dashboard.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS painter_id uuid REFERENCES public.painters(id),
  ADD COLUMN IF NOT EXISTS chat_channel_id text;

CREATE INDEX IF NOT EXISTS sessions_painter_id_idx ON public.sessions (painter_id);
CREATE INDEX IF NOT EXISTS sessions_chat_channel_id_idx ON public.sessions (chat_channel_id);
