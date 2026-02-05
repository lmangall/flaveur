const RAPIDAPI_KEY = process.env.X_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "professional-network-data.p.rapidapi.com";

// --- Search response types ---

interface LinkedInCompanySearchResult {
  id?: number;
  name: string;
  logo?: string;
  url?: string;
  staffCountRange?: Record<string, unknown>;
  headquarter?: Record<string, unknown>;
}

export interface LinkedInJobSearchResult {
  id: string;
  title: string;
  url: string;
  company: LinkedInCompanySearchResult;
  location: string;
  postAt: string;
  postedTimestamp: number;
}

export interface LinkedInSearchResponse {
  success: boolean;
  message: string;
  data: LinkedInJobSearchResult[];
  total: number;
}

// --- Detail response types ---

export interface LinkedInJobDetailResponse {
  success: boolean;
  message: string;
  data: LinkedInJobDetail;
}

export interface LinkedInJobDetail {
  id: string;
  state: string;
  title: string;
  description: string;
  url: string;
  applyMethod: {
    companyApplyUrl?: string;
    easyApplyUrl?: string;
  };
  company: {
    id: number;
    name: string;
    universalName: string;
    description: string;
    logo: string;
    url: string;
    followerCount: number;
    staffCount: number;
    staffCountRange: { start: number; end: number };
    industries: string[];
    headquarter: {
      geographicArea?: string;
      country?: string;
      city?: string;
      postalCode?: string;
      line1?: string;
    };
  };
  contentLanguage: { code: string; name: string };
  location: string;
  type: string; // "Full-time", "Part-time", "Contract", etc.
  workPlace: string; // "On-site", "Remote", "Hybrid"
  expireAt: number;
  jobFunctions: string[];
  industries: number[];
  formattedIndustries: string[];
  formattedExperienceLevel: string; // "Entry level", "Mid-Senior level", etc.
  listedAt: number;
  listedAtDate: string;
  originalListedAt: number;
  originalListedDate: string;
}

// --- Search params ---

export interface LinkedInSearchParams {
  keywords: string;
  locationId?: string;
  datePosted?: "pastMonth" | "past24Hours" | "pastWeek";
  sort?: "mostRelevant" | "mostRecent";
  start?: number;
}

// --- API functions ---

export async function searchLinkedInJobs(
  params: LinkedInSearchParams
): Promise<LinkedInSearchResponse> {
  if (!RAPIDAPI_KEY) {
    throw new Error("X_RAPIDAPI_KEY is not configured");
  }

  const url = new URL(
    "https://professional-network-data.p.rapidapi.com/search-jobs-v2"
  );
  url.searchParams.set("keywords", params.keywords);
  if (params.locationId) url.searchParams.set("locationId", params.locationId);
  if (params.datePosted) url.searchParams.set("datePosted", params.datePosted);
  url.searchParams.set("sort", params.sort || "mostRecent");
  if (params.start) url.searchParams.set("start", String(params.start));

  const response = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `LinkedIn API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json();
}

export async function getLinkedInJobDetail(
  jobId: string
): Promise<LinkedInJobDetailResponse> {
  if (!RAPIDAPI_KEY) {
    throw new Error("X_RAPIDAPI_KEY is not configured");
  }

  const url = new URL(
    "https://professional-network-data.p.rapidapi.com/get-job-details"
  );
  url.searchParams.set("id", jobId);

  const response = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `LinkedIn API error: ${response.status} ${response.statusText} - ${body}`
    );
  }

  return response.json();
}
