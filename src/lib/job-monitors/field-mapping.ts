import type { ExtractedJobDetail } from "./types";
import {
  isValidEmploymentType,
  isValidExperienceLevel,
  type EmploymentTypeValue,
  type ExperienceLevelValue,
} from "@/constants";

/**
 * Maps French contract types (from dataLayer) or JSON-LD employmentType
 * to our DB employment_type values.
 * Prefers the French contractType when available.
 */
export function mapEmploymentType(
  contractType: string | null,
  employmentType: string | null
): EmploymentTypeValue | "" {
  // French contract types from dataLayer (preferred)
  const frenchMap: Record<string, EmploymentTypeValue> = {
    CDI: "CDI",
    CDD: "CDD",
    "Intérim": "Interim",
    Interim: "Interim",
    Stage: "Internship",
    Alternance: "Alternance",
    Freelance: "Freelance",
  };

  if (contractType) {
    const mapped = frenchMap[contractType];
    if (mapped && isValidEmploymentType(mapped)) return mapped;
  }

  // Direct employment type strings (e.g., from LinkedIn API)
  const directMap: Record<string, EmploymentTypeValue> = {
    "Full-time": "Full-time",
    "Part-time": "Part-time",
    Contract: "Contract",
    Internship: "Internship",
    Temporary: "CDD",
  };

  if (employmentType) {
    const directMatch = directMap[employmentType];
    if (directMatch && isValidEmploymentType(directMatch)) return directMatch;
  }

  // JSON-LD employmentType fallback
  const jsonLdMap: Record<string, EmploymentTypeValue> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    TEMPORARY: "CDD",
    INTERN: "Internship",
    VOLUNTEER: "Full-time",
    PER_DIEM: "Contract",
    OTHER: "Full-time",
  };

  if (employmentType) {
    const mapped = jsonLdMap[employmentType.toUpperCase()];
    if (mapped && isValidEmploymentType(mapped)) return mapped;
  }

  return "";
}

/**
 * Maps months of experience to our experience level buckets.
 */
export function mapExperienceLevel(
  months: number | null
): ExperienceLevelValue | "" {
  if (months === null || months < 0) return "";

  const years = months / 12;
  if (years <= 2) return "0-2";
  if (years <= 5) return "3-5";
  if (years <= 10) return "6-10";
  return "10+";
}

/**
 * Strips HTML tags and decodes basic entities, returning plain text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface JobFormPrefillData {
  title: string;
  description: string;
  company_name: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary: string;
  industry: string;
  source_website: string;
  source_url: string;
  expires_at: string;
}

/**
 * Converts an ExtractedJobDetail into the shape expected by JobForm's initial state.
 */
export function mapDetailToJobFormData(
  detail: ExtractedJobDetail
): JobFormPrefillData {
  const employmentType = mapEmploymentType(
    detail.contractType,
    detail.employmentType
  );

  const experienceLevel = mapExperienceLevel(detail.experienceMonths);
  if (experienceLevel && !isValidExperienceLevel(experienceLevel)) {
    // Should not happen given our mapExperienceLevel, but guard anyway
  }

  // Format salary from JSON-LD estimatedSalary
  const salary = detail.salary || "";

  // Extract domain for source_website
  let sourceWebsite = "";
  try {
    sourceWebsite = new URL(detail.sourceUrl).hostname.replace("www.", "");
  } catch {
    sourceWebsite = "hellowork.com";
  }

  // Format expires_at as YYYY-MM-DD for date input
  let expiresAt = "";
  if (detail.expiresAt) {
    try {
      expiresAt = new Date(detail.expiresAt).toISOString().split("T")[0];
    } catch {
      // ignore invalid date
    }
  }

  return {
    title: detail.title,
    description: stripHtml(detail.description),
    company_name: detail.company || "",
    location: detail.location || "",
    employment_type: employmentType,
    experience_level: experienceLevel,
    salary,
    industry: "Aromes & Parfumerie",
    source_website: sourceWebsite,
    source_url: detail.sourceUrl,
    expires_at: expiresAt,
  };
}
