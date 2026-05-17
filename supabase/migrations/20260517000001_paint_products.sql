CREATE TABLE IF NOT EXISTS public.paint_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  product_name text NOT NULL,
  colour_name text NOT NULL,
  hex_code text,
  rgb_r integer,
  rgb_g integer,
  rgb_b integer,
  finish text,
  coverage_m2_per_litre numeric,
  coats_recommended integer DEFAULT 2,
  size_litres numeric[],
  approx_price_gbp numeric[],
  colour_family text,
  product_url text,
  amazon_search_url text,
  bq_search_url text,
  source_url text NOT NULL,
  scraped_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(brand, colour_name, finish)
);

ALTER TABLE public.paint_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_paint_products" ON public.paint_products
  FOR SELECT USING (true);
