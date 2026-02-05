const LINKEDIN_PREFIX = "linkedin://search?";

export interface LinkedInMonitorParams {
  keywords: string;
  locationId: string;
  datePosted: "pastMonth" | "past24Hours" | "pastWeek";
}

export function encodeLinkedInSearchUrl(
  params: LinkedInMonitorParams
): string {
  const searchParams = new URLSearchParams();
  searchParams.set("keywords", params.keywords);
  searchParams.set("locationId", params.locationId);
  searchParams.set("datePosted", params.datePosted);
  return LINKEDIN_PREFIX + searchParams.toString();
}

export function isLinkedInSearchUrl(url: string): boolean {
  return url.startsWith(LINKEDIN_PREFIX);
}

export function decodeLinkedInSearchUrl(url: string): LinkedInMonitorParams {
  if (!isLinkedInSearchUrl(url)) {
    throw new Error("Not a LinkedIn search URL");
  }
  const searchParams = new URLSearchParams(url.slice(LINKEDIN_PREFIX.length));
  return {
    keywords: searchParams.get("keywords") || "",
    locationId: searchParams.get("locationId") || "105015875",
    datePosted:
      (searchParams.get("datePosted") as LinkedInMonitorParams["datePosted"]) ||
      "pastWeek",
  };
}
