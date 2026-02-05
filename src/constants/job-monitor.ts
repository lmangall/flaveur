export const SITE_KEY_OPTIONS = [
  { value: "hellowork", label: "HelloWork" },
  { value: "indeed", label: "Indeed" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

export type SiteKeyValue = (typeof SITE_KEY_OPTIONS)[number]["value"];

export const isValidSiteKey = (value: string): value is SiteKeyValue =>
  SITE_KEY_OPTIONS.some((s) => s.value === value);

// LinkedIn-specific constants for monitor configuration

export const LINKEDIN_LOCATION_OPTIONS = [
  { value: "105015875", label: "France" },
  { value: "104246759", label: "Paris, France" },
  { value: "105556378", label: "Grasse, France" },
  { value: "90009717", label: "Lyon, France" },
  { value: "100676238", label: "Marseille, France" },
  { value: "104884765", label: "Toulouse, France" },
] as const;

export type LinkedInLocationValue =
  (typeof LINKEDIN_LOCATION_OPTIONS)[number]["value"];

export const LINKEDIN_DATE_POSTED_OPTIONS = [
  { value: "past24Hours", label: "Past 24 hours" },
  { value: "pastWeek", label: "Past week" },
  { value: "pastMonth", label: "Past month" },
] as const;

export type LinkedInDatePostedValue =
  (typeof LINKEDIN_DATE_POSTED_OPTIONS)[number]["value"];

/** Site keys that use API-based extraction instead of Puppeteer scraping */
export const API_BASED_SITE_KEYS: SiteKeyValue[] = ["linkedin", "indeed"];
