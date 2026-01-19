-- Job Alert Preferences Table
-- Stores user preferences for job notifications

CREATE TABLE IF NOT EXISTS job_alert_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Filter criteria (all nullable - null means "any")
  locations TEXT[], -- Array of location strings to match
  employment_types TEXT[], -- Array of employment types to match
  experience_levels TEXT[], -- Array of experience levels to match
  keywords TEXT[], -- Keywords to search in title/description

  -- Notification settings
  is_active BOOLEAN DEFAULT TRUE,
  frequency VARCHAR(20) DEFAULT 'daily', -- 'instant', 'daily', 'weekly'

  -- Tracking
  last_notified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one preference set per user
  CONSTRAINT unique_user_alert UNIQUE (user_id)
);

-- Index for active alerts lookup
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON job_alert_preferences(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alert_preferences(user_id);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_job_alert_preferences_timestamp ON job_alert_preferences;
CREATE TRIGGER update_job_alert_preferences_timestamp
  BEFORE UPDATE ON job_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
