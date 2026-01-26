-- Migration: Add Learning System Tables
-- Date: 2026-01-25
-- Description: Adds tables for the flavor learning feature including queue, progress tracking,
--              spaced repetition reviews, quiz attempts, study sessions, streaks, and badges.

-- ============================================
-- 1. LEARNING QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS user_learning_queue (
  queue_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  target_date DATE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, substance_id)
);

COMMENT ON TABLE user_learning_queue IS 'Substances the user wants to learn, with priority ordering';

-- ============================================
-- 2. LEARNING PROGRESS
-- ============================================

CREATE TABLE IF NOT EXISTS substance_learning_progress (
  progress_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,

  -- Sensory confirmation (required for advancement)
  has_smelled BOOLEAN DEFAULT FALSE,
  smelled_at TIMESTAMP,
  has_tasted BOOLEAN DEFAULT FALSE,
  tasted_at TIMESTAMP,

  -- Mastery status
  status TEXT NOT NULL DEFAULT 'not_started',

  -- Personal documentation
  personal_notes TEXT,
  personal_descriptors TEXT[],
  associations TEXT,
  sample_photo_url TEXT,
  concentration_notes TEXT,

  -- Timestamps
  started_at TIMESTAMP,
  mastered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, substance_id),
  CONSTRAINT substance_learning_progress_status_check
    CHECK (status IN ('not_started', 'learning', 'confident', 'mastered'))
);

COMMENT ON TABLE substance_learning_progress IS 'Tracks user progress on learning each substance';
COMMENT ON COLUMN substance_learning_progress.status IS 'not_started = queued, learning = actively studying, confident = knows well, mastered = fully learned';

-- ============================================
-- 3. SPACED REPETITION REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS learning_review (
  review_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,

  scheduled_for TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  review_result TEXT,
  confidence_after INTEGER,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT learning_review_result_check
    CHECK (review_result IS NULL OR review_result IN ('correct', 'incorrect', 'partial')),
  CONSTRAINT learning_review_confidence_check
    CHECK (confidence_after IS NULL OR (confidence_after >= 1 AND confidence_after <= 5))
);

COMMENT ON TABLE learning_review IS 'Scheduled spaced repetition reviews for substances';

-- ============================================
-- 4. QUIZ ATTEMPTS
-- ============================================

CREATE TABLE IF NOT EXISTS learning_quiz_attempt (
  attempt_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,

  -- User's guess before reveal
  guessed_name TEXT,
  observations TEXT,

  -- Self-assessment after reveal
  result TEXT NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT learning_quiz_attempt_result_check
    CHECK (result IN ('correct', 'incorrect', 'partial'))
);

COMMENT ON TABLE learning_quiz_attempt IS 'Records of blind quiz attempts for testing knowledge';

-- ============================================
-- 5. STUDY SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS learning_session (
  session_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  scheduled_for DATE,
  duration_minutes INTEGER,

  -- Post-session reflection
  reflection_notes TEXT,
  completed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE learning_session IS 'Study sessions grouping multiple substances for lab practice';

-- ============================================
-- 6. SESSION SUBSTANCES
-- ============================================

CREATE TABLE IF NOT EXISTS learning_session_substance (
  session_id INTEGER NOT NULL REFERENCES learning_session(session_id) ON DELETE CASCADE,
  substance_id INTEGER NOT NULL REFERENCES substance(substance_id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  session_code TEXT,
  PRIMARY KEY (session_id, substance_id)
);

COMMENT ON TABLE learning_session_substance IS 'Substances included in a study session with blind codes';
COMMENT ON COLUMN learning_session_substance.session_code IS 'Blind code like A1, B2 for lab practice';

-- ============================================
-- 7. STREAK TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS learning_streak (
  streak_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  streak_freezes_available INTEGER DEFAULT 0
);

COMMENT ON TABLE learning_streak IS 'Tracks daily study streaks for gamification';

-- ============================================
-- 8. USER BADGES
-- ============================================

CREATE TABLE IF NOT EXISTS user_badge (
  badge_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

COMMENT ON TABLE user_badge IS 'Badges earned by users for learning achievements';

-- ============================================
-- 9. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_learning_queue_user ON user_learning_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_queue_priority ON user_learning_queue(user_id, priority DESC);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON substance_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_status ON substance_learning_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_learning_review_scheduled ON learning_review(user_id, scheduled_for) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_learning_review_user ON learning_review(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_session_user ON learning_session(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_quiz_user ON learning_quiz_attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_user ON user_badge(user_id);
