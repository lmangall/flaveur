"use server";

import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { REVIEW_INTERVALS, BADGE_DEFINITIONS, type BadgeKey } from "@/constants";
import type {
  LearningQueueItem,
  SubstanceLearningProgress,
  LearningReview,
  LearningSession,
  LearningDashboardStats,
  UserBadge,
} from "@/app/type";
import { getPostHogClient } from "@/lib/posthog-server";

// ─────────────────────────────────────────────────────────────
// QUEUE MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function getMyLearningQueue(): Promise<LearningQueueItem[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT
      q.queue_id, q.user_id, q.substance_id, q.priority, q.target_date, q.added_at,
      s.substance_id as "substance.substance_id",
      s.common_name as "substance.common_name",
      s.fema_number as "substance.fema_number",
      s.cas_id as "substance.cas_id",
      s.flavor_profile as "substance.flavor_profile",
      s.fema_flavor_profile as "substance.fema_flavor_profile",
      p.status as progress_status,
      p.has_smelled,
      p.has_tasted
    FROM user_learning_queue q
    JOIN substance s ON q.substance_id = s.substance_id
    LEFT JOIN substance_learning_progress p ON p.substance_id = q.substance_id AND p.user_id = q.user_id
    WHERE q.user_id = ${userId}
    ORDER BY q.priority DESC, q.added_at ASC
  `;

  return result.map((row) => ({
    queue_id: Number(row.queue_id),
    user_id: String(row.user_id),
    substance_id: Number(row.substance_id),
    priority: Number(row.priority),
    target_date: row.target_date ? String(row.target_date) : null,
    added_at: String(row.added_at),
    substance: {
      substance_id: Number(row["substance.substance_id"]),
      common_name: String(row["substance.common_name"]),
      fema_number: row["substance.fema_number"] ? Number(row["substance.fema_number"]) : null,
      cas_id: row["substance.cas_id"] ? String(row["substance.cas_id"]) : null,
      flavor_profile: row["substance.flavor_profile"] ? String(row["substance.flavor_profile"]) : null,
      fema_flavor_profile: row["substance.fema_flavor_profile"] ? String(row["substance.fema_flavor_profile"]) : null,
    },
    progress_status: row.progress_status ? String(row.progress_status) : "not_started",
    has_smelled: Boolean(row.has_smelled),
    has_tasted: Boolean(row.has_tasted),
  })) as LearningQueueItem[];
}

export async function addToLearningQueue(
  substanceId: number,
  priority: number = 0,
  targetDate?: string
) {
  const userId = await getUserId();

  // Check substance exists
  const substanceCheck = await sql`
    SELECT substance_id FROM substance WHERE substance_id = ${substanceId}
  `;
  if (substanceCheck.length === 0) {
    throw new Error("Substance not found");
  }

  await sql`
    INSERT INTO user_learning_queue (user_id, substance_id, priority, target_date)
    VALUES (${userId}, ${substanceId}, ${priority}, ${targetDate ?? null})
    ON CONFLICT (user_id, substance_id) DO UPDATE
    SET priority = EXCLUDED.priority, target_date = EXCLUDED.target_date
  `;

  // Initialize progress record if not exists
  await sql`
    INSERT INTO substance_learning_progress (user_id, substance_id)
    VALUES (${userId}, ${substanceId})
    ON CONFLICT (user_id, substance_id) DO NOTHING
  `;

  // Track substance added to queue in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "substance_added_to_queue",
    properties: {
      substance_id: substanceId,
      priority,
      has_target_date: !!targetDate,
    },
  });

  revalidatePath("/learn");
  return { success: true };
}

export async function removeFromQueue(substanceId: number) {
  const userId = await getUserId();

  await sql`
    DELETE FROM user_learning_queue
    WHERE user_id = ${userId} AND substance_id = ${substanceId}
  `;

  revalidatePath("/learn");
  return { success: true };
}

export async function reorderQueue(orderedIds: number[]) {
  const userId = await getUserId();

  // Update priorities based on array order
  for (let i = 0; i < orderedIds.length; i++) {
    await sql`
      UPDATE user_learning_queue
      SET priority = ${orderedIds.length - i}
      WHERE user_id = ${userId} AND substance_id = ${orderedIds[i]}
    `;
  }

  revalidatePath("/learn");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// LEARNING PROGRESS
// ─────────────────────────────────────────────────────────────

export async function getMyProgress(substanceId: number): Promise<SubstanceLearningProgress | null> {
  const userId = await getUserId();

  const result = await sql`
    SELECT p.*,
           s.common_name as "substance.common_name",
           s.fema_number as "substance.fema_number",
           s.flavor_profile as "substance.flavor_profile"
    FROM substance_learning_progress p
    JOIN substance s ON p.substance_id = s.substance_id
    WHERE p.user_id = ${userId} AND p.substance_id = ${substanceId}
  `;

  if (result.length === 0) return null;

  const row = result[0];
  return {
    progress_id: Number(row.progress_id),
    user_id: String(row.user_id),
    substance_id: Number(row.substance_id),
    has_smelled: Boolean(row.has_smelled),
    smelled_at: row.smelled_at ? String(row.smelled_at) : null,
    has_tasted: Boolean(row.has_tasted),
    tasted_at: row.tasted_at ? String(row.tasted_at) : null,
    status: String(row.status) as SubstanceLearningProgress["status"],
    personal_notes: row.personal_notes ? String(row.personal_notes) : null,
    personal_descriptors: row.personal_descriptors as string[] || [],
    associations: row.associations ? String(row.associations) : null,
    sample_photo_url: row.sample_photo_url ? String(row.sample_photo_url) : null,
    concentration_notes: row.concentration_notes ? String(row.concentration_notes) : null,
    started_at: row.started_at ? String(row.started_at) : null,
    mastered_at: row.mastered_at ? String(row.mastered_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    substance: {
      substance_id: Number(row.substance_id),
      common_name: String(row["substance.common_name"]),
      fema_number: row["substance.fema_number"] ? Number(row["substance.fema_number"]) : null,
      flavor_profile: row["substance.flavor_profile"] ? String(row["substance.flavor_profile"]) : null,
    },
  } as SubstanceLearningProgress;
}

export async function getAllMyProgress(): Promise<SubstanceLearningProgress[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT p.*, s.common_name, s.fema_number, s.cas_id, s.flavor_profile
    FROM substance_learning_progress p
    JOIN substance s ON p.substance_id = s.substance_id
    WHERE p.user_id = ${userId}
    ORDER BY p.updated_at DESC
  `;

  return result.map((row) => ({
    progress_id: Number(row.progress_id),
    user_id: String(row.user_id),
    substance_id: Number(row.substance_id),
    has_smelled: Boolean(row.has_smelled),
    smelled_at: row.smelled_at ? String(row.smelled_at) : null,
    has_tasted: Boolean(row.has_tasted),
    tasted_at: row.tasted_at ? String(row.tasted_at) : null,
    status: String(row.status) as SubstanceLearningProgress["status"],
    personal_notes: row.personal_notes ? String(row.personal_notes) : null,
    personal_descriptors: row.personal_descriptors as string[] || [],
    associations: row.associations ? String(row.associations) : null,
    sample_photo_url: row.sample_photo_url ? String(row.sample_photo_url) : null,
    concentration_notes: row.concentration_notes ? String(row.concentration_notes) : null,
    started_at: row.started_at ? String(row.started_at) : null,
    mastered_at: row.mastered_at ? String(row.mastered_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    substance: {
      substance_id: Number(row.substance_id),
      common_name: String(row.common_name),
      fema_number: row.fema_number ? Number(row.fema_number) : null,
      cas_id: row.cas_id ? String(row.cas_id) : null,
      flavor_profile: row.flavor_profile ? String(row.flavor_profile) : null,
    },
  })) as SubstanceLearningProgress[];
}

export async function recordSensoryExperience(
  substanceId: number,
  type: "smell" | "taste",
  value: boolean = true
) {
  const userId = await getUserId();

  // Ensure progress record exists
  await sql`
    INSERT INTO substance_learning_progress (user_id, substance_id)
    VALUES (${userId}, ${substanceId})
    ON CONFLICT (user_id, substance_id) DO NOTHING
  `;

  if (type === "smell") {
    await sql`
      UPDATE substance_learning_progress
      SET has_smelled = ${value},
          smelled_at = ${value ? sql`NOW()` : sql`NULL`},
          status = CASE WHEN status = 'not_started' AND ${value} THEN 'learning' ELSE status END,
          started_at = COALESCE(started_at, NOW()),
          updated_at = NOW()
      WHERE user_id = ${userId} AND substance_id = ${substanceId}
    `;
  } else {
    await sql`
      UPDATE substance_learning_progress
      SET has_tasted = ${value},
          tasted_at = ${value ? sql`NOW()` : sql`NULL`},
          status = CASE WHEN status = 'not_started' AND ${value} THEN 'learning' ELSE status END,
          started_at = COALESCE(started_at, NOW()),
          updated_at = NOW()
      WHERE user_id = ${userId} AND substance_id = ${substanceId}
    `;
  }

  // Check for first-time badges only when checking (not unchecking)
  if (value) {
    await checkAndAwardBadge(userId, type === "smell" ? "first_sniff" : "taste_explorer");
  }

  // Update streak
  await updateStreak(userId);

  // No revalidatePath - client uses optimistic updates
  return { success: true };
}

export async function updateProgressStatus(substanceId: number, newStatus: string) {
  const userId = await getUserId();

  // Validate: cannot advance to confident/mastered without sensory confirmation
  if (newStatus === "confident" || newStatus === "mastered") {
    const progress = await sql`
      SELECT has_smelled, has_tasted FROM substance_learning_progress
      WHERE user_id = ${userId} AND substance_id = ${substanceId}
    `;

    if (!progress[0]?.has_smelled || !progress[0]?.has_tasted) {
      throw new Error("Must smell and taste substance before advancing to " + newStatus);
    }
  }

  await sql`
    UPDATE substance_learning_progress
    SET status = ${newStatus},
        mastered_at = CASE WHEN ${newStatus} = 'mastered' THEN NOW() ELSE mastered_at END,
        updated_at = NOW()
    WHERE user_id = ${userId} AND substance_id = ${substanceId}
  `;

  // Schedule next review based on status
  if (newStatus !== "not_started") {
    const intervalKey = newStatus as keyof typeof REVIEW_INTERVALS;
    const interval = REVIEW_INTERVALS[intervalKey] ?? 7;
    await sql`
      INSERT INTO learning_review (user_id, substance_id, scheduled_for)
      VALUES (${userId}, ${substanceId}, NOW() + INTERVAL '${sql.unsafe(String(interval))} days')
    `;
  }

  // Update streak
  await updateStreak(userId);

  // Check milestone badges
  await checkMilestoneBadges(userId);

  // Track learning progress update in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "learning_progress_updated",
    properties: {
      substance_id: substanceId,
      new_status: newStatus,
    },
  });

  revalidatePath("/learn");
  return { success: true };
}

export async function updateProgressNotes(
  substanceId: number,
  data: {
    personal_notes?: string;
    personal_descriptors?: string[];
    associations?: string;
    concentration_notes?: string;
  }
) {
  const userId = await getUserId();

  // Build dynamic update
  const updates: string[] = ["updated_at = NOW()"];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.personal_notes !== undefined) {
    updates.push(`personal_notes = $${paramIndex++}`);
    values.push(data.personal_notes);
  }
  if (data.personal_descriptors !== undefined) {
    updates.push(`personal_descriptors = $${paramIndex++}`);
    values.push(data.personal_descriptors);
  }
  if (data.associations !== undefined) {
    updates.push(`associations = $${paramIndex++}`);
    values.push(data.associations);
  }
  if (data.concentration_notes !== undefined) {
    updates.push(`concentration_notes = $${paramIndex++}`);
    values.push(data.concentration_notes);
  }

  // Use a simpler update approach
  await sql`
    UPDATE substance_learning_progress
    SET personal_notes = COALESCE(${data.personal_notes ?? null}, personal_notes),
        personal_descriptors = COALESCE(${data.personal_descriptors ?? null}, personal_descriptors),
        associations = COALESCE(${data.associations ?? null}, associations),
        concentration_notes = COALESCE(${data.concentration_notes ?? null}, concentration_notes),
        updated_at = NOW()
    WHERE user_id = ${userId} AND substance_id = ${substanceId}
  `;

  revalidatePath("/learn");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// REVIEWS (Spaced Repetition)
// ─────────────────────────────────────────────────────────────

export async function getDueReviews(): Promise<LearningReview[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT r.*, s.common_name, s.fema_number, s.flavor_profile
    FROM learning_review r
    JOIN substance s ON r.substance_id = s.substance_id
    WHERE r.user_id = ${userId}
      AND r.completed_at IS NULL
      AND r.scheduled_for <= NOW() + INTERVAL '1 day'
    ORDER BY r.scheduled_for ASC
    LIMIT 20
  `;

  return result.map((row) => ({
    review_id: Number(row.review_id),
    user_id: String(row.user_id),
    substance_id: Number(row.substance_id),
    scheduled_for: String(row.scheduled_for),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    review_result: row.review_result ? String(row.review_result) : null,
    confidence_after: row.confidence_after ? Number(row.confidence_after) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    substance: {
      substance_id: Number(row.substance_id),
      common_name: String(row.common_name),
      fema_number: row.fema_number ? Number(row.fema_number) : null,
      flavor_profile: row.flavor_profile ? String(row.flavor_profile) : null,
    },
  })) as LearningReview[];
}

export async function completeReview(
  reviewId: number,
  result: string,
  confidenceAfter: number,
  notes?: string
) {
  const userId = await getUserId();

  await sql`
    UPDATE learning_review
    SET completed_at = NOW(),
        review_result = ${result},
        confidence_after = ${confidenceAfter},
        notes = ${notes ?? null}
    WHERE review_id = ${reviewId} AND user_id = ${userId}
  `;

  // Schedule next review based on result
  const review = await sql`SELECT substance_id FROM learning_review WHERE review_id = ${reviewId}`;
  const substanceId = review[0]?.substance_id;

  if (substanceId) {
    const interval = result === "correct" ? 14 : result === "partial" ? 7 : 3;
    await sql`
      INSERT INTO learning_review (user_id, substance_id, scheduled_for)
      VALUES (${userId}, ${substanceId}, NOW() + INTERVAL '${sql.unsafe(String(interval))} days')
    `;
  }

  revalidatePath("/learn/reviews");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// QUIZ MODE
// ─────────────────────────────────────────────────────────────

export async function getRandomQuizSubstance() {
  const userId = await getUserId();

  // Get a random substance from user's learning queue that they've started
  const result = await sql`
    SELECT s.substance_id, s.fema_number, s.common_name
    FROM substance_learning_progress p
    JOIN substance s ON p.substance_id = s.substance_id
    WHERE p.user_id = ${userId}
      AND p.status IN ('learning', 'confident', 'mastered')
    ORDER BY RANDOM()
    LIMIT 1
  `;

  return result[0] ?? null;
}

export async function submitQuizAttempt(
  substanceId: number,
  guessedName: string | null,
  observations: string | null,
  result: string
) {
  const userId = await getUserId();

  await sql`
    INSERT INTO learning_quiz_attempt (user_id, substance_id, guessed_name, observations, result)
    VALUES (${userId}, ${substanceId}, ${guessedName}, ${observations}, ${result})
  `;

  // Track quiz completion in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "quiz_completed",
    properties: {
      substance_id: substanceId,
      result,
      had_guess: !!guessedName,
      had_observations: !!observations,
    },
  });

  // Check quiz badges
  await checkQuizBadges(userId);

  revalidatePath("/learn/quiz");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// STUDY SESSIONS
// ─────────────────────────────────────────────────────────────

export async function createStudySession(data: {
  name: string;
  description?: string;
  scheduled_for?: string;
  duration_minutes?: number;
  substance_ids: number[];
}) {
  const userId = await getUserId();

  const session = await sql`
    INSERT INTO learning_session (user_id, name, description, scheduled_for, duration_minutes)
    VALUES (${userId}, ${data.name}, ${data.description ?? null}, ${data.scheduled_for ?? null}, ${data.duration_minutes ?? null})
    RETURNING session_id
  `;

  const sessionId = session[0].session_id;

  // Add substances with auto-generated codes
  for (let i = 0; i < data.substance_ids.length; i++) {
    const code = String.fromCharCode(65 + Math.floor(i / 10)) + (i % 10 + 1);
    await sql`
      INSERT INTO learning_session_substance (session_id, substance_id, order_index, session_code)
      VALUES (${sessionId}, ${data.substance_ids[i]}, ${i}, ${code})
    `;
  }

  // Track study session creation in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "study_session_created",
    properties: {
      session_id: sessionId,
      substance_count: data.substance_ids.length,
      has_scheduled_time: !!data.scheduled_for,
      duration_minutes: data.duration_minutes ?? null,
    },
  });

  revalidatePath("/learn/sessions");
  return { session_id: sessionId };
}

export async function getMySessions(): Promise<LearningSession[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT ls.*,
           COUNT(lss.substance_id) as substance_count
    FROM learning_session ls
    LEFT JOIN learning_session_substance lss ON ls.session_id = lss.session_id
    WHERE ls.user_id = ${userId}
    GROUP BY ls.session_id
    ORDER BY ls.created_at DESC
  `;

  return result.map((row) => ({
    session_id: Number(row.session_id),
    user_id: String(row.user_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    scheduled_for: row.scheduled_for ? String(row.scheduled_for) : null,
    duration_minutes: row.duration_minutes ? Number(row.duration_minutes) : null,
    reflection_notes: row.reflection_notes ? String(row.reflection_notes) : null,
    completed_at: row.completed_at ? String(row.completed_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    substance_count: Number(row.substance_count),
  })) as LearningSession[];
}

export async function getSessionDetails(sessionId: number) {
  const userId = await getUserId();

  const session = await sql`
    SELECT * FROM learning_session
    WHERE session_id = ${sessionId} AND user_id = ${userId}
  `;

  if (!session[0]) return null;

  const substances = await sql`
    SELECT lss.*, s.common_name, s.fema_number, s.flavor_profile
    FROM learning_session_substance lss
    JOIN substance s ON lss.substance_id = s.substance_id
    WHERE lss.session_id = ${sessionId}
    ORDER BY lss.order_index
  `;

  return {
    ...session[0],
    substances: substances.map((row) => ({
      session_id: Number(row.session_id),
      substance_id: Number(row.substance_id),
      order_index: Number(row.order_index),
      session_code: row.session_code ? String(row.session_code) : null,
      substance: {
        substance_id: Number(row.substance_id),
        common_name: String(row.common_name),
        fema_number: row.fema_number ? Number(row.fema_number) : null,
        flavor_profile: row.flavor_profile ? String(row.flavor_profile) : null,
      },
    })),
  };
}

export async function completeSession(sessionId: number, reflectionNotes?: string) {
  const userId = await getUserId();

  await sql`
    UPDATE learning_session
    SET completed_at = NOW(),
        reflection_notes = ${reflectionNotes ?? null},
        updated_at = NOW()
    WHERE session_id = ${sessionId} AND user_id = ${userId}
  `;

  // Track study session completion in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "study_session_completed",
    properties: {
      session_id: sessionId,
      has_reflection_notes: !!reflectionNotes,
    },
  });

  revalidatePath("/learn/sessions");
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD & STATS
// ─────────────────────────────────────────────────────────────

export async function getLearningDashboardStats(): Promise<LearningDashboardStats> {
  const userId = await getUserId();

  const stats = await sql`
    SELECT
      (SELECT COUNT(*) FROM user_learning_queue WHERE user_id = ${userId})::int as total_in_queue,
      (SELECT COUNT(*) FROM substance_learning_progress WHERE user_id = ${userId} AND status = 'not_started')::int as not_started,
      (SELECT COUNT(*) FROM substance_learning_progress WHERE user_id = ${userId} AND status = 'learning')::int as learning,
      (SELECT COUNT(*) FROM substance_learning_progress WHERE user_id = ${userId} AND status = 'confident')::int as confident,
      (SELECT COUNT(*) FROM substance_learning_progress WHERE user_id = ${userId} AND status = 'mastered')::int as mastered,
      (SELECT COALESCE(current_streak, 0) FROM learning_streak WHERE user_id = ${userId})::int as current_streak,
      (SELECT COALESCE(longest_streak, 0) FROM learning_streak WHERE user_id = ${userId})::int as longest_streak,
      (SELECT COUNT(*) FROM learning_review WHERE user_id = ${userId} AND completed_at IS NULL AND scheduled_for <= NOW())::int as reviews_due,
      (SELECT COUNT(*) FROM user_badge WHERE user_id = ${userId})::int as badges_earned
  `;

  const row = stats[0];
  return {
    total_in_queue: Number(row.total_in_queue) || 0,
    not_started: Number(row.not_started) || 0,
    learning: Number(row.learning) || 0,
    confident: Number(row.confident) || 0,
    mastered: Number(row.mastered) || 0,
    current_streak: Number(row.current_streak) || 0,
    longest_streak: Number(row.longest_streak) || 0,
    reviews_due: Number(row.reviews_due) || 0,
    badges_earned: Number(row.badges_earned) || 0,
  };
}

// ─────────────────────────────────────────────────────────────
// BADGES & STREAKS
// ─────────────────────────────────────────────────────────────

export async function getMyBadges(): Promise<(UserBadge & { definition: typeof BADGE_DEFINITIONS[BadgeKey] })[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT * FROM user_badge WHERE user_id = ${userId} ORDER BY earned_at DESC
  `;

  return result.map((badge) => ({
    badge_id: Number(badge.badge_id),
    user_id: String(badge.user_id),
    badge_key: String(badge.badge_key) as BadgeKey,
    earned_at: String(badge.earned_at),
    definition: BADGE_DEFINITIONS[badge.badge_key as BadgeKey],
  }));
}

async function checkAndAwardBadge(userId: string, badgeKey: string) {
  // Check if already earned
  const existing = await sql`
    SELECT 1 FROM user_badge WHERE user_id = ${userId} AND badge_key = ${badgeKey}
  `;

  if (existing.length === 0) {
    await sql`
      INSERT INTO user_badge (user_id, badge_key) VALUES (${userId}, ${badgeKey})
    `;

    // Track badge earned in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "badge_earned",
      properties: {
        badge_key: badgeKey,
        badge_name: BADGE_DEFINITIONS[badgeKey as BadgeKey]?.name ?? badgeKey,
        badge_description: BADGE_DEFINITIONS[badgeKey as BadgeKey]?.description ?? null,
      },
    });
  }
}

async function checkMilestoneBadges(userId: string) {
  const masteredCount = await sql`
    SELECT COUNT(*)::int as count FROM substance_learning_progress
    WHERE user_id = ${userId} AND status = 'mastered'
  `;

  const count = Number(masteredCount[0]?.count) || 0;

  if (count >= 1) await checkAndAwardBadge(userId, "first_mastery");
  if (count >= 10) await checkAndAwardBadge(userId, "dedicated_learner");
  if (count >= 100) await checkAndAwardBadge(userId, "century_club_bronze");
  if (count >= 250) await checkAndAwardBadge(userId, "century_club_silver");
}

async function checkQuizBadges(userId: string) {
  const quizCount = await sql`
    SELECT COUNT(*)::int as count FROM learning_quiz_attempt WHERE user_id = ${userId}
  `;

  if (Number(quizCount[0]?.count) >= 100) {
    await checkAndAwardBadge(userId, "quiz_master");
  }
}

async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  // Check if streak record exists
  const existing = await sql`
    SELECT * FROM learning_streak WHERE user_id = ${userId}
  `;

  if (existing.length === 0) {
    // Create new streak record
    await sql`
      INSERT INTO learning_streak (user_id, current_streak, longest_streak, last_study_date)
      VALUES (${userId}, 1, 1, ${today})
    `;
  } else {
    const lastStudyDate = existing[0].last_study_date;
    const currentStreak = Number(existing[0].current_streak) || 0;
    const longestStreak = Number(existing[0].longest_streak) || 0;

    // Check if this is the same day, next day, or broken streak
    const todayDate = new Date(today);
    const lastDate = lastStudyDate ? new Date(lastStudyDate) : null;

    let newStreak = currentStreak;
    if (lastDate) {
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, no change
        return;
      } else if (diffDays === 1) {
        // Next day, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Broken streak, reset to 1
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);

    await sql`
      UPDATE learning_streak
      SET current_streak = ${newStreak},
          longest_streak = ${newLongest},
          last_study_date = ${today}
      WHERE user_id = ${userId}
    `;

    // Check streak badges
    if (newStreak >= 7) await checkAndAwardBadge(userId, "consistent_scholar_7");
    if (newStreak >= 30) await checkAndAwardBadge(userId, "consistent_scholar_30");
    if (newStreak >= 60) await checkAndAwardBadge(userId, "consistent_scholar_60");
  }
}

// ─────────────────────────────────────────────────────────────
// SEARCH SUBSTANCES (for adding to queue)
// ─────────────────────────────────────────────────────────────

export async function searchSubstancesForQueue(query: string, limit: number = 20) {
  const userId = await getUserId();

  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query}%`;

  const result = await sql`
    SELECT s.substance_id, s.fema_number, s.common_name, s.flavor_profile,
           CASE WHEN q.queue_id IS NOT NULL THEN true ELSE false END as in_queue
    FROM substance s
    LEFT JOIN user_learning_queue q ON s.substance_id = q.substance_id AND q.user_id = ${userId}
    WHERE s.common_name ILIKE ${searchTerm}
       OR s.fema_number::text ILIKE ${searchTerm}
       OR s.cas_id ILIKE ${searchTerm}
    ORDER BY
      CASE WHEN LOWER(s.common_name) = LOWER(${query}) THEN 1 ELSE 2 END,
      s.common_name
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    substance_id: Number(row.substance_id),
    fema_number: row.fema_number ? Number(row.fema_number) : null,
    common_name: String(row.common_name),
    flavor_profile: row.flavor_profile ? String(row.flavor_profile) : null,
    in_queue: Boolean(row.in_queue),
  }));
}
