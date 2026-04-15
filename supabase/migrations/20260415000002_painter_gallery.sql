CREATE TABLE IF NOT EXISTS painter_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  painter_id uuid REFERENCES painters(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  image_size_bytes integer NOT NULL DEFAULT 0,
  caption text,
  job_type text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE painter_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "painters_own_gallery" ON painter_gallery
  FOR ALL 
  USING (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    painter_id IN (
      SELECT id FROM painters WHERE user_id = auth.uid()
    )
  );

CREATE INDEX painter_gallery_painter_id_idx 
  ON painter_gallery (painter_id);
