export interface EUAdditiveRecord {
  policy_item_code: string;
  additive_e_code: string;
  additive_name: string;
  additive_synonyms: string | null;
  additive_message: string | null;
  additive_is_a_group: string;
  member_of_groups: string | null;
  fip_url: string;
  food_category: string;
  food_category_level: string;
  food_category_desc: string | null;
  restriction_type: string | null;
  restriction_value: string | null;
  restriction_unit: string | null;
  restriction_comment: string | null;
  restriction_note: string | null;
  legislation_short: string | null;
  legislation_reference: string;
  legislation_pub_date: string | null;
  legislation_oj_ref: string | null;
  legislation_entry_into_force_date: string | null;
  legislation_application_date: string | null;
  legislation_url: string | null;
}

const EU_API_URL =
  "https://api.datalake.sante.service.ec.europa.eu/food-additives/download?format=json&api-version=v2.0";

// Simple in-memory cache
let cachedData: EUAdditiveRecord[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
let fetchPromise: Promise<EUAdditiveRecord[]> | null = null;

/**
 * Strip HTML tags from additive names (API returns names wrapped in <p> tags)
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

async function fetchEUAdditives(): Promise<EUAdditiveRecord[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(EU_API_URL, {
      signal: controller.signal,
      cache: "force-cache",
    });

    if (!response.ok) {
      throw new Error(`EU API request failed: ${response.status}`);
    }

    const text = await response.text();

    // Parse newline-delimited JSON and clean up names
    return text
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((line) => {
        const record = JSON.parse(line);
        return {
          ...record,
          additive_name: stripHtml(record.additive_name || ""),
        } as EUAdditiveRecord;
      });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getEUAdditives(): Promise<EUAdditiveRecord[]> {
  const now = Date.now();

  // Return cached data if valid
  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData;
  }

  // If a fetch is already in progress, wait for it
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start new fetch
  fetchPromise = fetchEUAdditives()
    .then((data) => {
      cachedData = data;
      cacheTimestamp = now;
      fetchPromise = null;
      return data;
    })
    .catch((error) => {
      fetchPromise = null;
      throw error;
    });

  return fetchPromise;
}

/**
 * Find EU regulatory data by exact chemical name match
 * Also checks synonyms for better matching
 */
export async function findEUDataByName(
  chemicalName: string
): Promise<EUAdditiveRecord | null> {
  const allRecords = await getEUAdditives();
  const normalized = chemicalName.toLowerCase().trim();

  // First try exact name match
  const exactMatch = allRecords.find(
    (r) => r.additive_name.toLowerCase().trim() === normalized
  );
  if (exactMatch) return exactMatch;

  // Try matching against synonyms
  return (
    allRecords.find((r) => {
      if (!r.additive_synonyms) return false;
      const synonyms = r.additive_synonyms
        .toLowerCase()
        .split(";")
        .map((s) => s.trim());
      return synonyms.includes(normalized);
    }) || null
  );
}

/**
 * Search EU additives by partial name match
 */
export async function searchEUAdditives(
  query: string,
  limit: number = 50
): Promise<EUAdditiveRecord[]> {
  const allRecords = await getEUAdditives();
  const normalized = query.toLowerCase();

  return allRecords
    .filter(
      (r) =>
        r.additive_name.toLowerCase().includes(normalized) ||
        r.additive_e_code.toLowerCase().includes(normalized) ||
        (r.additive_synonyms?.toLowerCase().includes(normalized) ?? false)
    )
    .slice(0, limit);
}

/**
 * Get all restricted substances from EU database
 */
export async function getRestrictedEUAdditives(): Promise<EUAdditiveRecord[]> {
  const allRecords = await getEUAdditives();
  return allRecords.filter(
    (r) => r.restriction_type !== null && r.restriction_type !== "quantum satis"
  );
}

// ===========================================
// EU COMPLIANCE DATA TYPES & FUNCTIONS
// ===========================================

export interface EUFoodCategory {
  level: string;
  name: string;
  description: string | null;
  restrictionType: string | null;
  restrictionValue: number | null;
  restrictionUnit: string | null;
  restrictionComment: string | null;
  restrictionNote: string | null;
}

export interface EULegislation {
  short: string;
  reference: string;
  ojRef: string | null;
  pubDate: string | null;
  entryIntoForceDate: string | null;
  applicationDate: string | null;
  url: string | null;
}

export interface EURestriction {
  type: string | null;
  value: number | null;
  unit: string | null;
  comment: string | null;
  foodCategory: string;
}

export interface EUComplianceData {
  found: boolean;
  name: string;
  eNumber: string;
  isRestricted: boolean;
  restrictions: EURestriction[];
  legislation: string;
  detailsUrl: string;
}

export interface EUAdditiveFullData {
  found: boolean;
  name: string;
  eNumber: string;
  synonyms: string[];
  groupMessage: string | null;
  isGroup: boolean;
  memberOfGroups: string | null;
  detailsUrl: string;
  foodCategories: EUFoodCategory[];
  legislation: EULegislation;
  hasRestrictions: boolean;
}

/**
 * Get detailed EU compliance data for a substance by name
 * Returns all records for the substance (may have multiple food category entries)
 */
export async function getEUComplianceData(
  chemicalName: string
): Promise<EUComplianceData | null> {
  const allRecords = await getEUAdditives();
  const normalized = chemicalName.toLowerCase().trim();

  // Find all records for this substance (may have multiple food category entries)
  // Match by name or synonyms
  const matches = allRecords.filter((r) => {
    if (r.additive_name.toLowerCase().trim() === normalized) return true;
    if (r.additive_synonyms) {
      const synonyms = r.additive_synonyms
        .toLowerCase()
        .split(";")
        .map((s) => s.trim());
      if (synonyms.includes(normalized)) return true;
    }
    return false;
  });

  if (matches.length === 0) return null;

  const restrictions: EURestriction[] = matches
    .filter(
      (m) =>
        m.restriction_type &&
        m.restriction_type !== "quantum satis" &&
        m.restriction_value
    )
    .map((m) => ({
      type: m.restriction_type,
      value: m.restriction_value ? parseFloat(m.restriction_value) : null,
      unit: m.restriction_unit,
      comment: m.restriction_comment,
      foodCategory: m.food_category,
    }));

  return {
    found: true,
    name: matches[0].additive_name,
    eNumber: matches[0].additive_e_code,
    isRestricted: restrictions.length > 0,
    restrictions,
    legislation: matches[0].legislation_short || "",
    detailsUrl: matches[0].fip_url,
  };
}

/**
 * Search EU by partial name for suggestions
 */
export async function searchEUByName(
  query: string,
  limit = 10
): Promise<string[]> {
  const allRecords = await getEUAdditives();
  const normalized = query.toLowerCase();

  const matches = allRecords
    .filter(
      (r) =>
        r.additive_name.toLowerCase().includes(normalized) ||
        r.additive_e_code.toLowerCase().includes(normalized)
    )
    .map((r) => r.additive_name);

  // Deduplicate and limit
  return [...new Set(matches)].slice(0, limit);
}

/**
 * Get full detailed EU data for a substance (for modal display)
 * Returns all food categories, legislation details, etc.
 */
export async function getEUAdditiveFullData(
  chemicalName: string
): Promise<EUAdditiveFullData | null> {
  const allRecords = await getEUAdditives();
  const normalized = chemicalName.toLowerCase().trim();

  // Find all records for this substance
  const matches = allRecords.filter((r) => {
    if (r.additive_name.toLowerCase().trim() === normalized) return true;
    if (r.additive_synonyms) {
      const synonyms = r.additive_synonyms
        .toLowerCase()
        .split(";")
        .map((s) => s.trim());
      if (synonyms.includes(normalized)) return true;
    }
    return false;
  });

  if (matches.length === 0) return null;

  const first = matches[0];

  // Build food categories list
  const foodCategories: EUFoodCategory[] = matches.map((m) => ({
    level: m.food_category_level,
    name: m.food_category,
    description: m.food_category_desc,
    restrictionType: m.restriction_type,
    restrictionValue: m.restriction_value ? parseFloat(m.restriction_value) : null,
    restrictionUnit: m.restriction_unit,
    restrictionComment: m.restriction_comment,
    restrictionNote: m.restriction_note,
  }));

  // Sort by category level
  foodCategories.sort((a, b) => a.level.localeCompare(b.level));

  // Parse synonyms
  const synonyms = first.additive_synonyms
    ? first.additive_synonyms.split(";").map((s) => s.trim()).filter(Boolean)
    : [];

  // Check if any category has non-quantum-satis restrictions
  const hasRestrictions = matches.some(
    (m) =>
      m.restriction_type &&
      m.restriction_type !== "quantum satis" &&
      m.restriction_value
  );

  return {
    found: true,
    name: first.additive_name,
    eNumber: first.additive_e_code,
    synonyms,
    groupMessage: first.additive_message,
    isGroup: first.additive_is_a_group === "YES",
    memberOfGroups: first.member_of_groups,
    detailsUrl: first.fip_url,
    foodCategories,
    legislation: {
      short: first.legislation_short || "",
      reference: first.legislation_reference,
      ojRef: first.legislation_oj_ref,
      pubDate: first.legislation_pub_date,
      entryIntoForceDate: first.legislation_entry_into_force_date,
      applicationDate: first.legislation_application_date,
      url: first.legislation_url,
    },
    hasRestrictions,
  };
}

// Legacy exports for backward compatibility
export const getEUFlavourings = getEUAdditives;
export const searchEUFlavourings = searchEUAdditives;
export const getRestrictedEUFlavourings = getRestrictedEUAdditives;
export type EUFlavouringRecord = EUAdditiveRecord;
