import type { ExtractedListing } from "../types";

const RAPIDAPI_KEY = process.env.X_RAPIDAPI_KEY;

interface IndeedApiHit {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    type: string; // "YEARLY", "MONTHLY", etc.
  };
  formatted_relative_time?: string;
  link?: string;
  locality?: string;
  pub_date_ts_milli?: number;
}

interface IndeedApiResponse {
  count: number;
  hits: IndeedApiHit[];
  indeed_final_url?: string;
  next_page_id?: string | null;
}

/**
 * Parse an Indeed search URL into RapidAPI query parameters.
 * Supports URLs like: https://fr.indeed.com/jobs?q=aromaticien&l=france&fromage=last
 */
function parseIndeedSearchUrl(searchUrl: string): {
  query: string;
  location: string;
  locality: string;
  fromage: string;
} {
  const url = new URL(searchUrl);
  const hostname = url.hostname; // e.g. "fr.indeed.com"
  const locality = hostname.split(".")[0]; // "fr"

  return {
    query: url.searchParams.get("q") || "",
    location: url.searchParams.get("l") || "",
    locality: locality === "www" ? "us" : locality,
    fromage: url.searchParams.get("fromage") || "1",
  };
}

function formatSalary(
  salary: IndeedApiHit["salary"]
): string | null {
  if (!salary) return null;
  const { min, max, type } = salary;

  const typeLabel =
    type === "YEARLY"
      ? "/ an"
      : type === "MONTHLY"
        ? "/ mois"
        : type === "HOURLY"
          ? "/ heure"
          : "";

  if (min === max) {
    return `${min.toLocaleString("fr-FR")} € ${typeLabel}`.trim();
  }
  return `${min.toLocaleString("fr-FR")} - ${max.toLocaleString("fr-FR")} € ${typeLabel}`.trim();
}

/**
 * Extract Indeed job listings via RapidAPI (no Puppeteer needed).
 */
export async function extractIndeedListings(
  searchUrl: string
): Promise<ExtractedListing[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error("X_RAPIDAPI_KEY is not configured");
  }

  const params = parseIndeedSearchUrl(searchUrl);

  const apiUrl = new URL("https://indeed12.p.rapidapi.com/jobs/search");
  apiUrl.searchParams.set("query", params.query);
  apiUrl.searchParams.set("location", params.location);
  apiUrl.searchParams.set("locality", params.locality);
  apiUrl.searchParams.set("fromage", params.fromage);
  apiUrl.searchParams.set("sort", "date");
  apiUrl.searchParams.set("page_id", "1");

  const response = await fetch(apiUrl.toString(), {
    headers: {
      "x-rapidapi-host": "indeed12.p.rapidapi.com",
      "x-rapidapi-key": RAPIDAPI_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Indeed API error: ${response.status} ${response.statusText}`);
  }

  const data: IndeedApiResponse = await response.json();

  if (!data.hits || data.hits.length === 0) {
    return [];
  }

  const seen = new Set<string>();

  return data.hits
    .filter((hit) => {
      if (seen.has(hit.id)) return false;
      seen.add(hit.id);
      return true;
    })
    .map((hit) => ({
      externalId: hit.id,
      title: hit.title,
      company: hit.company_name || null,
      location: hit.location || null,
      employmentType: null,
      salary: formatSalary(hit.salary),
      listingUrl: `https://fr.indeed.com/viewjob?jk=${hit.id}`,
    }));
}
