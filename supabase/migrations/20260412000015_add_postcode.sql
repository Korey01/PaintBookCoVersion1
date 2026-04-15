-- Add postcode column to painters
ALTER TABLE painters
ADD COLUMN IF NOT EXISTS postcode text;

-- Add postcode to jobs too
ALTER TABLE jobs  
ADD COLUMN IF NOT EXISTS postcode text;

-- Index for postcode searches
CREATE INDEX IF NOT EXISTS painters_postcode_idx 
ON painters (postcode);

CREATE INDEX IF NOT EXISTS jobs_postcode_idx
ON jobs (postcode);
