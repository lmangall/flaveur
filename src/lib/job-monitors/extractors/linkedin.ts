import type { ExtractedListing } from "../types";
import { searchLinkedInJobs } from "../linkedin-api";
import { decodeLinkedInSearchUrl } from "../linkedin-params";

/**
 * Extract LinkedIn job listings via RapidAPI (no Puppeteer needed).
 * The searchUrl is a `linkedin://search?...` encoded string from the monitor config.
 */
export async function extractLinkedInListings(
  searchUrl: string
): Promise<ExtractedListing[]> {
  const params = decodeLinkedInSearchUrl(searchUrl);

  const response = await searchLinkedInJobs({
    keywords: params.keywords,
    locationId: params.locationId,
    datePosted: params.datePosted,
    sort: "mostRecent",
  });

  if (!response.success || !response.data) {
    return [];
  }

  return response.data.map((job) => ({
    externalId: String(job.id),
    title: job.title,
    company: job.company?.name || null,
    location: job.location || null,
    employmentType: null, // Not available in search results
    salary: null, // Not available in search results
    listingUrl:
      job.url || `https://www.linkedin.com/jobs/view/${job.id}`,
  }));
}
