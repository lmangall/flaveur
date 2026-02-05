export const SITE_KEY_OPTIONS = [
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

export type SiteKeyValue = (typeof SITE_KEY_OPTIONS)[number]["value"];

export const isValidSiteKey = (value: string): value is SiteKeyValue =>
  SITE_KEY_OPTIONS.some((s) => s.value === value);
