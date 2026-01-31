// Profile domain constants
// Single source of truth for profile-related enum values

export const PROFILE_TYPE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Professional" },
  { value: "hobbyist", label: "Hobbyist" },
  { value: "educator", label: "Educator" },
] as const;

export type ProfileTypeValue = (typeof PROFILE_TYPE_OPTIONS)[number]["value"];

export const isValidProfileType = (value: string): value is ProfileTypeValue =>
  PROFILE_TYPE_OPTIONS.some((p) => p.value === value);

export const YEARS_OF_EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
] as const;

export type YearsOfExperienceValue =
  (typeof YEARS_OF_EXPERIENCE_OPTIONS)[number]["value"];

export const isValidYearsOfExperience = (
  value: string
): value is YearsOfExperienceValue =>
  YEARS_OF_EXPERIENCE_OPTIONS.some((e) => e.value === value);

export const FIELD_OF_STUDY_OPTIONS = [
  { value: "chemistry", label: "Chemistry" },
  { value: "food_science", label: "Food Science" },
  { value: "biochemistry", label: "Biochemistry" },
  { value: "chemical_engineering", label: "Chemical Engineering" },
  { value: "biology", label: "Biology" },
  { value: "culinary_arts", label: "Culinary Arts" },
  { value: "other", label: "Other" },
] as const;

export type FieldOfStudyValue =
  (typeof FIELD_OF_STUDY_OPTIONS)[number]["value"];

export const isValidFieldOfStudy = (
  value: string
): value is FieldOfStudyValue =>
  FIELD_OF_STUDY_OPTIONS.some((f) => f.value === value);

export const SOCIAL_PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { value: "instagram", label: "Instagram", icon: "instagram" },
  { value: "twitter", label: "X / Twitter", icon: "twitter" },
  { value: "github", label: "GitHub", icon: "github" },
  { value: "website", label: "Website", icon: "globe" },
  { value: "other", label: "Other", icon: "link" },
] as const;

export type SocialPlatformValue =
  (typeof SOCIAL_PLATFORM_OPTIONS)[number]["value"];

export const isValidSocialPlatform = (
  value: string
): value is SocialPlatformValue =>
  SOCIAL_PLATFORM_OPTIONS.some((s) => s.value === value);

export const ONBOARDING_STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "skipped", label: "Skipped" },
] as const;

export type OnboardingStatusValue =
  (typeof ONBOARDING_STATUS_OPTIONS)[number]["value"];

export const isValidOnboardingStatus = (
  value: string
): value is OnboardingStatusValue =>
  ONBOARDING_STATUS_OPTIONS.some((s) => s.value === value);
