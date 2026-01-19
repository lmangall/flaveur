// Job domain constants
// Single source of truth for job-related enum values

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
  { value: "Freelance", label: "Freelance" },
  { value: "CDI", label: "CDI" },
  { value: "CDD", label: "CDD" },
  { value: "Interim", label: "Interim" },
] as const;

export type EmploymentTypeValue = (typeof EMPLOYMENT_TYPE_OPTIONS)[number]["value"];

export const isValidEmploymentType = (value: string): value is EmploymentTypeValue =>
  EMPLOYMENT_TYPE_OPTIONS.some((e) => e.value === value);

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "Entry", label: "Entry Level" },
  { value: "Mid", label: "Mid Level" },
  { value: "Senior", label: "Senior" },
  { value: "Executive", label: "Executive" },
] as const;

export type ExperienceLevelValue = (typeof EXPERIENCE_LEVEL_OPTIONS)[number]["value"];

export const isValidExperienceLevel = (value: string): value is ExperienceLevelValue =>
  EXPERIENCE_LEVEL_OPTIONS.some((e) => e.value === value);

export const JOB_INTERACTION_OPTIONS = [
  { value: "viewed", label: "Viewed" },
  { value: "applied", label: "Applied" },
  { value: "seen_contact", label: "Seen Contact" },
] as const;

export type JobInteractionValue = (typeof JOB_INTERACTION_OPTIONS)[number]["value"];

export const isValidJobInteraction = (value: string): value is JobInteractionValue =>
  JOB_INTERACTION_OPTIONS.some((i) => i.value === value);

// Contact person type for job offers
export interface ContactPerson {
  name?: string;
  email?: string;
  phone?: string;
}

// Job alert frequency options
export const JOB_ALERT_FREQUENCY_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
] as const;

export type JobAlertFrequencyValue = (typeof JOB_ALERT_FREQUENCY_OPTIONS)[number]["value"];

export const isValidJobAlertFrequency = (value: string): value is JobAlertFrequencyValue =>
  JOB_ALERT_FREQUENCY_OPTIONS.some((f) => f.value === value);
