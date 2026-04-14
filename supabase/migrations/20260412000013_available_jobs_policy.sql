-- Migration: available_jobs_policy
-- Painters can browse all unassigned available jobs on the platform.
-- Full property address is NOT included in the select list shown to painters
-- until escrow is funded (enforced at the application layer).

-- Drop existing policy if it exists to allow clean re-run
DROP POLICY IF EXISTS "painters_view_available_jobs" ON jobs;
DROP POLICY IF EXISTS "customers_view_own_jobs" ON jobs;

-- Combined RLS policy for the jobs table
CREATE POLICY "painters_view_available_jobs"
  ON jobs FOR SELECT
  USING (
    -- Customers can always see their own jobs
    customer_id = auth.uid()

    OR

    -- Approved painters can see all unassigned available jobs (the job board)
    (
      status IN ('pending_match', 'matching_in_progress')
      AND assigned_painter_id IS NULL
      AND EXISTS (
        SELECT 1 FROM painters
        WHERE user_id = auth.uid()
          AND kyc_status = 'approved'
          AND is_active = true
      )
    )

    OR

    -- Painters can always see jobs assigned to them
    assigned_painter_id IN (
      SELECT id FROM painters
      WHERE user_id = auth.uid()
    )
  );
