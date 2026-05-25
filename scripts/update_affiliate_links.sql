-- PaintBookCo Affiliate Link Updates
-- Run against: public.paint_products in Supabase

-- Update B&Q links to Amazon search (B&Q moving to Impact, Amazon as fallback)
UPDATE public.paint_products
SET bq_search_url = CONCAT(
    'https://www.amazon.co.uk/s?k=',
    REPLACE(REPLACE(colour_name, ' ', '+'), '&', '%26'),
    '+',
    REPLACE(REPLACE(brand, ' ', '+'), '&', '%26'),
    '+paint&tag=paintbookco-21'
)
WHERE bq_search_url LIKE 'https://www.diy.com%';

-- Add Wickes affiliate URL column
ALTER TABLE public.paint_products
ADD COLUMN IF NOT EXISTS wickes_search_url text;

-- Wickes Awin links for Dulux, Crown, Valspar (programme pending approval)
UPDATE public.paint_products
SET wickes_search_url = CONCAT(
    'https://www.awin1.com/cread.php?awinmid=1563&awinaffid=2909131&ued=',
    'https://www.wickes.co.uk/search?term=',
    REPLACE(REPLACE(colour_name, ' ', '%20'), '&', '%26'),
    '%20paint'
)
WHERE brand IN ('Dulux', 'Crown', 'Valspar');

-- Farrow & Ball direct Awin link (programme pending approval)
UPDATE public.paint_products
SET wickes_search_url = CONCAT(
    'https://www.awin1.com/cread.php?awinmid=20199&awinaffid=2909131&ued=',
    'https://www.farrow-ball.com/paint-colours/',
    REPLACE(LOWER(colour_name), ' ', '-')
)
WHERE brand = 'Farrow & Ball';
