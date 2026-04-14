-- ============================================================
-- PaintBookCo — Notification preferences
-- Migration: 20260412000011_notification_prefs
-- ============================================================
-- One row per user. Upserted by the NotificationPreferences
-- React component via the Supabase client.
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        REFERENCES auth.users(id) UNIQUE,
  email_reviews    boolean     DEFAULT true,
  email_jobs       boolean     DEFAULT true,
  email_milestones boolean     DEFAULT true,
  email_disputes   boolean     DEFAULT true,
  email_marketing  boolean     DEFAULT false,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_prefs" ON notification_preferences;
CREATE POLICY "users_own_prefs" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Auto-update updated_at (reuses function from 20260412000002)
DROP TRIGGER IF EXISTS notification_prefs_updated_at
  ON notification_preferences;

CREATE TRIGGER notification_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
