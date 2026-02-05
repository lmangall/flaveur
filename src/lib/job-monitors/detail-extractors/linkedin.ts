import type { ExtractedJobDetail } from "../types";
import { getLinkedInJobDetail } from "../linkedin-api";

/**
 * Extract full job details from LinkedIn via RapidAPI (no Puppeteer needed).
 * Extracts the LinkedIn job ID from the listing URL and calls get-job-details.
 */
export async function extractLinkedInDetail(
  listingUrl: string
): Promise<ExtractedJobDetail> {
  const idMatch = listingUrl.match(/\/jobs\/view\/(\d+)/);
  if (!idMatch) {
    throw new Error(
      `Cannot extract LinkedIn job ID from URL: ${listingUrl}`
    );
  }

  const response = await getLinkedInJobDetail(idMatch[1]);

  if (!response.success || !response.data) {
    throw new Error("LinkedIn API returned no data for job detail");
  }

  const detail = response.data;

  // Map LinkedIn employment type to French contract type
  const contractTypeMap: Record<string, string> = {
    "Full-time": "CDI",
    "Part-time": "Part-time",
    Contract: "CDD",
    Internship: "Stage",
    Temporary: "Intérim",
  };

  // Map formattedExperienceLevel to approximate months
  let experienceMonths: number | null = null;
  const expLevel = (detail.formattedExperienceLevel || "").toLowerCase();
  if (expLevel.includes("entry") || expLevel.includes("internship"))
    experienceMonths = 12;
  else if (expLevel.includes("associate")) experienceMonths = 24;
  else if (expLevel.includes("mid-senior")) experienceMonths = 72;
  else if (expLevel.includes("director")) experienceMonths = 120;
  else if (expLevel.includes("executive")) experienceMonths = 180;

  return {
    title: detail.title || "",
    description: detail.description || "",
    company: detail.company?.name || null,
    location: detail.location || null,
    employmentType: detail.type || null,
    contractType: contractTypeMap[detail.type] || null,
    salary: null, // LinkedIn API does not provide salary data
    postedAt: detail.listedAt
      ? new Date(detail.listedAt).toISOString()
      : null,
    expiresAt: detail.expireAt
      ? new Date(detail.expireAt).toISOString()
      : null,
    experienceMonths,
    sourceUrl: listingUrl,
  };
}
