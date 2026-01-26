// Learning domain constants
// Single source of truth for learning-related enum values

// Learning status progression
export const LEARNING_STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "learning", label: "Learning" },
  { value: "confident", label: "Confident" },
  { value: "mastered", label: "Mastered" },
] as const;

export type LearningStatus = (typeof LEARNING_STATUS_OPTIONS)[number]["value"];

export const isValidLearningStatus = (value: string): value is LearningStatus =>
  LEARNING_STATUS_OPTIONS.some((s) => s.value === value);

// Review results
export const REVIEW_RESULT_OPTIONS = [
  { value: "correct", label: "Correct" },
  { value: "incorrect", label: "Incorrect" },
  { value: "partial", label: "Partially Correct" },
] as const;

export type ReviewResult = (typeof REVIEW_RESULT_OPTIONS)[number]["value"];

export const isValidReviewResult = (value: string): value is ReviewResult =>
  REVIEW_RESULT_OPTIONS.some((r) => r.value === value);

// Spaced repetition intervals (days)
export const REVIEW_INTERVALS = {
  learning: 1, // Review tomorrow
  confident: 3, // Review in 3 days
  mastered: 14, // Review in 2 weeks
} as const;

// Badge rarity
export const BADGE_RARITY_OPTIONS = [
  { value: "common", label: "Common", color: "gray" },
  { value: "uncommon", label: "Uncommon", color: "green" },
  { value: "rare", label: "Rare", color: "blue" },
  { value: "epic", label: "Epic", color: "purple" },
  { value: "legendary", label: "Legendary", color: "orange" },
] as const;

export type BadgeRarity = (typeof BADGE_RARITY_OPTIONS)[number]["value"];

// Badge definitions
export const BADGE_DEFINITIONS = {
  // First steps
  first_sniff: {
    key: "first_sniff",
    name: "First Sniff",
    description: "Smell your first substance",
    icon: "👃",
    xp: 25,
    rarity: "common" as BadgeRarity,
  },
  taste_explorer: {
    key: "taste_explorer",
    name: "Taste Explorer",
    description: "Taste your first substance",
    icon: "👅",
    xp: 25,
    rarity: "common" as BadgeRarity,
  },

  // Progress milestones
  first_mastery: {
    key: "first_mastery",
    name: "First Mastery",
    description: "Master your first substance",
    icon: "⭐",
    xp: 50,
    rarity: "common" as BadgeRarity,
  },
  dedicated_learner: {
    key: "dedicated_learner",
    name: "Dedicated Learner",
    description: "Master 10 substances",
    icon: "📚",
    xp: 150,
    rarity: "uncommon" as BadgeRarity,
    threshold: 10,
  },
  century_club_bronze: {
    key: "century_club_bronze",
    name: "Century Club",
    description: "Master 100 substances",
    icon: "🏆",
    xp: 500,
    rarity: "rare" as BadgeRarity,
    tier: "bronze",
    threshold: 100,
  },
  century_club_silver: {
    key: "century_club_silver",
    name: "Century Club Silver",
    description: "Master 250 substances",
    icon: "🏆",
    xp: 1000,
    rarity: "epic" as BadgeRarity,
    tier: "silver",
    threshold: 250,
  },

  // Consistency
  consistent_scholar_7: {
    key: "consistent_scholar_7",
    name: "Week Warrior",
    description: "7-day study streak",
    icon: "🔥",
    xp: 100,
    rarity: "uncommon" as BadgeRarity,
    threshold: 7,
  },
  consistent_scholar_30: {
    key: "consistent_scholar_30",
    name: "Consistent Scholar",
    description: "30-day study streak",
    icon: "🔥",
    xp: 400,
    rarity: "rare" as BadgeRarity,
    threshold: 30,
  },
  consistent_scholar_60: {
    key: "consistent_scholar_60",
    name: "Dedicated Learner",
    description: "60-day study streak",
    icon: "🔥",
    xp: 800,
    rarity: "epic" as BadgeRarity,
    threshold: 60,
  },

  // Quality
  note_taker: {
    key: "note_taker",
    name: "Note Taker",
    description: "Write detailed notes on 50 substances",
    icon: "📝",
    xp: 250,
    rarity: "uncommon" as BadgeRarity,
    threshold: 50,
  },

  // Speed
  speed_learner: {
    key: "speed_learner",
    name: "Speed Learner",
    description: "Master 10 substances in one week",
    icon: "⚡",
    xp: 150,
    rarity: "uncommon" as BadgeRarity,
    threshold: 10,
  },

  // Quiz
  quiz_master: {
    key: "quiz_master",
    name: "Quiz Master",
    description: "Complete 100 quiz attempts",
    icon: "🎓",
    xp: 200,
    rarity: "uncommon" as BadgeRarity,
    threshold: 100,
  },
  perfectionist: {
    key: "perfectionist",
    name: "Perfectionist",
    description: "100% accuracy on 20 quiz attempts in a row",
    icon: "✨",
    xp: 300,
    rarity: "rare" as BadgeRarity,
    threshold: 20,
  },

  // Category champions
  category_champion: {
    key: "category_champion",
    name: "Category Champion",
    description: "Master all substances in a category",
    icon: "👑",
    xp: 200,
    rarity: "rare" as BadgeRarity,
  },
} as const;

export type BadgeKey = keyof typeof BADGE_DEFINITIONS;

export const isValidBadgeKey = (value: string): value is BadgeKey =>
  value in BADGE_DEFINITIONS;

// Confidence levels for reviews
export const CONFIDENCE_LEVELS = [
  { value: 1, label: "Not at all", description: "Couldn't identify it" },
  { value: 2, label: "Barely", description: "Very uncertain" },
  { value: 3, label: "Somewhat", description: "Had some idea" },
  { value: 4, label: "Mostly", description: "Fairly confident" },
  { value: 5, label: "Completely", description: "Knew it instantly" },
] as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number]["value"];
