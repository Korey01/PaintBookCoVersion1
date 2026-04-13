-- ============================================================
-- PaintBookCo — Reviews trigger and public read policy
-- Migration: 20260412000010_reviews_trigger
-- ============================================================
-- Depends on: 20260412000005_milestones_reviews_audit (reviews table)
--             20260412000002_painters (painters table)
-- ============================================================

-- ── Auto-update painter avg_rating on each new review ─────────

CREATE OR REPLACE FUNCTION update_painter_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE painters
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE painter_id = NEW.painter_id
  ),
  updated_at = now()
  WHERE id = NEW.painter_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_inserted ON reviews;

CREATE TRIGGER on_review_inserted
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_painter_avg_rating();

-- ── Allow public read of reviews (painter profile pages) ──────
-- The existing customers_own_reviews policy covers writes.
-- This additional policy allows any authenticated user to
-- read reviews so painter profiles can display them publicly.

DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);
