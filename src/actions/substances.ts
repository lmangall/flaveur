"use server";

import { sql } from "@/lib/db";

export async function getSubstances(page: number = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await sql`
    SELECT * FROM substance LIMIT ${limit} OFFSET ${offset}
  `;

  return result;
}

export async function searchSubstances(
  query: string,
  category: string = "all",
  page: number = 1,
  limit: number = 20
) {
  if (!query) {
    throw new Error("Search query is required");
  }

  const offset = (page - 1) * limit;
  const searchTerm = `%${query}%`;

  let results: Record<string, unknown>[];
  let totalResults: number;

  switch (category) {
    case "name":
      // Simple keyword search on names with exact match prioritization
      results = await sql`
        SELECT *,
          CASE
            WHEN LOWER(common_name) = LOWER(${query}) THEN 1
            WHEN LOWER(common_name) LIKE LOWER(${query}) || '%' THEN 2
            WHEN common_name ILIKE ${searchTerm} THEN 3
            WHEN alternative_names::text ILIKE ${searchTerm} THEN 4
            ELSE 5
          END AS name_match_priority
        FROM substance
        WHERE common_name ILIKE ${searchTerm}
           OR alternative_names::text ILIKE ${searchTerm}
        ORDER BY name_match_priority ASC, common_name
        LIMIT ${limit} OFFSET ${offset}
      `;
      const nameCount = await sql`
        SELECT COUNT(*) FROM substance
        WHERE common_name ILIKE ${searchTerm}
           OR alternative_names::text ILIKE ${searchTerm}
      `;
      totalResults = parseInt(nameCount[0].count as string);
      break;

    case "profile":
      // Simple keyword search on flavor/odor profiles
      results = await sql`
        SELECT *
        FROM substance
        WHERE olfactory_taste_notes ILIKE ${searchTerm}
           OR flavor_profile ILIKE ${searchTerm}
           OR fema_flavor_profile ILIKE ${searchTerm}
           OR taste ILIKE ${searchTerm}
           OR odor ILIKE ${searchTerm}
        ORDER BY common_name
        LIMIT ${limit} OFFSET ${offset}
      `;
      const profileCount = await sql`
        SELECT COUNT(*) FROM substance
        WHERE olfactory_taste_notes ILIKE ${searchTerm}
           OR flavor_profile ILIKE ${searchTerm}
           OR fema_flavor_profile ILIKE ${searchTerm}
           OR taste ILIKE ${searchTerm}
           OR odor ILIKE ${searchTerm}
      `;
      totalResults = parseInt(profileCount[0].count as string);
      break;

    case "cas_id":
      // CAS ID: exact pattern match is more appropriate
      results = await sql`
        SELECT * FROM substance
        WHERE cas_id ILIKE ${searchTerm}
        ORDER BY cas_id
        LIMIT ${limit} OFFSET ${offset}
      `;
      const casCount = await sql`
        SELECT COUNT(*) FROM substance WHERE cas_id ILIKE ${searchTerm}
      `;
      totalResults = parseInt(casCount[0].count as string);
      break;

    case "fema_number":
      // FEMA number: exact pattern match is more appropriate
      results = await sql`
        SELECT * FROM substance
        WHERE fema_number::text ILIKE ${searchTerm}
        ORDER BY fema_number
        LIMIT ${limit} OFFSET ${offset}
      `;
      const femaCount = await sql`
        SELECT COUNT(*) FROM substance WHERE fema_number::text ILIKE ${searchTerm}
      `;
      totalResults = parseInt(femaCount[0].count as string);
      break;

    case "all":
    default:
      // Simple keyword search with exact match prioritization
      results = await sql`
        SELECT *,
          CASE
            WHEN LOWER(common_name) = LOWER(${query}) THEN 1
            WHEN LOWER(common_name) LIKE LOWER(${query}) || '%' THEN 2
            WHEN common_name ILIKE ${searchTerm} THEN 3
            ELSE 4
          END AS name_match_priority
        FROM substance
        WHERE common_name ILIKE ${searchTerm}
           OR alternative_names::text ILIKE ${searchTerm}
           OR cas_id ILIKE ${searchTerm}
           OR fema_number::text ILIKE ${searchTerm}
        ORDER BY name_match_priority ASC, common_name
        LIMIT ${limit} OFFSET ${offset}
      `;
      const allCount = await sql`
        SELECT COUNT(*) FROM substance
        WHERE common_name ILIKE ${searchTerm}
           OR alternative_names::text ILIKE ${searchTerm}
           OR cas_id ILIKE ${searchTerm}
           OR fema_number::text ILIKE ${searchTerm}
      `;
      totalResults = parseInt(allCount[0].count as string);
      break;
  }

  return {
    results,
    pagination: {
      total: totalResults,
      page,
      limit,
      pages: Math.ceil(totalResults / limit),
    },
  };
}

export async function getSubstanceByFemaNumber(femaNumber: number) {
  if (isNaN(femaNumber)) {
    throw new Error("FEMA number must be a numeric value");
  }

  const result = await sql`
    SELECT * FROM substance WHERE fema_number = ${femaNumber}
  `;

  if (result.length === 0) {
    throw new Error(`Substance not found with FEMA number: ${femaNumber}`);
  }

  return result[0];
}

export async function getSubstancesWithSmiles(limit: number = 10) {
  const result = await sql`
    SELECT
      substance_id,
      fema_number,
      common_name,
      smile,
      molecular_formula,
      pubchem_cid,
      iupac_name
    FROM substance
    WHERE smile IS NOT NULL AND smile != ''
    LIMIT ${limit}
  `;

  return result;
}

export async function searchSubstancesWithSmiles(
  query: string,
  category: string = "all",
  limit: number = 20
) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = `%${query}%`;
  // Convert query to tsquery format for full-text search
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .join(" & ");

  let result: Record<string, unknown>[];

  switch (category) {
    case "name":
      result = await sql`
        SELECT substance_id, fema_number, common_name, smile, molecular_formula, pubchem_cid, iupac_name,
               ts_rank(search_vector, to_tsquery('english', ${tsQuery})) AS rank,
               CASE
                 WHEN LOWER(common_name) = LOWER(${query}) THEN 1
                 WHEN LOWER(common_name) LIKE LOWER(${query}) || '%' THEN 2
                 WHEN common_name ILIKE ${searchTerm} THEN 3
                 WHEN alternative_names::text ILIKE ${searchTerm} THEN 4
                 ELSE 5
               END AS name_match_priority
        FROM substance
        WHERE smile IS NOT NULL AND smile != ''
        AND (search_vector @@ to_tsquery('english', ${tsQuery})
             OR common_name ILIKE ${searchTerm}
             OR alternative_names::text ILIKE ${searchTerm})
        ORDER BY name_match_priority ASC, rank DESC NULLS LAST, common_name
        LIMIT ${limit}
      `;
      break;

    case "profile":
      result = await sql`
        SELECT substance_id, fema_number, common_name, smile, molecular_formula, pubchem_cid, iupac_name,
               ts_rank(search_vector, to_tsquery('english', ${tsQuery})) AS rank
        FROM substance
        WHERE smile IS NOT NULL AND smile != ''
        AND (search_vector @@ to_tsquery('english', ${tsQuery})
             OR olfactory_taste_notes ILIKE ${searchTerm}
             OR flavor_profile ILIKE ${searchTerm}
             OR fema_flavor_profile ILIKE ${searchTerm}
             OR taste ILIKE ${searchTerm}
             OR odor ILIKE ${searchTerm})
        ORDER BY rank DESC NULLS LAST, common_name
        LIMIT ${limit}
      `;
      break;

    case "cas_id":
      result = await sql`
        SELECT substance_id, fema_number, common_name, smile, molecular_formula, pubchem_cid, iupac_name
        FROM substance
        WHERE smile IS NOT NULL AND smile != ''
        AND cas_id ILIKE ${searchTerm}
        ORDER BY cas_id
        LIMIT ${limit}
      `;
      break;

    case "fema_number":
      result = await sql`
        SELECT substance_id, fema_number, common_name, smile, molecular_formula, pubchem_cid, iupac_name
        FROM substance
        WHERE smile IS NOT NULL AND smile != ''
        AND fema_number::text ILIKE ${searchTerm}
        ORDER BY fema_number
        LIMIT ${limit}
      `;
      break;

    case "all":
    default:
      result = await sql`
        SELECT substance_id, fema_number, common_name, smile, molecular_formula, pubchem_cid, iupac_name,
               ts_rank(search_vector, to_tsquery('english', ${tsQuery})) AS rank,
               CASE
                 WHEN LOWER(common_name) = LOWER(${query}) THEN 1
                 WHEN LOWER(common_name) LIKE LOWER(${query}) || '%' THEN 2
                 WHEN common_name ILIKE ${searchTerm} THEN 3
                 ELSE 4
               END AS name_match_priority
        FROM substance
        WHERE smile IS NOT NULL AND smile != ''
        AND (search_vector @@ to_tsquery('english', ${tsQuery})
             OR common_name ILIKE ${searchTerm}
             OR cas_id ILIKE ${searchTerm}
             OR fema_number::text ILIKE ${searchTerm})
        ORDER BY name_match_priority ASC, rank DESC NULLS LAST, common_name
        LIMIT ${limit}
      `;
      break;
  }

  return result;
}

export async function createSubstance(data: {
  fema_number: number;
  common_name: string;
  iupac_name?: string;
  cas_id?: string;
  pubchem_id?: string;
  smile?: string;
  inchi?: string;
  odor?: string;
  flavor_profile?: string;
  fema_flavor_profile?: string;
  is_synthetic?: boolean;
  is_natural?: boolean;
  molecular_weight?: number;
  exact_mass?: number;
  unknown_natural?: boolean;
  functional_groups?: string;
  xlogp?: number;
}) {
  const result = await sql`
    INSERT INTO substance (
      fema_number, common_name, iupac_name, cas_id, pubchem_id,
      smile, inchi, odor, flavor_profile, fema_flavor_profile,
      synthetic, is_natural, molecular_weight, exact_mass,
      unknown_natural, functional_groups, xlogp
    )
    VALUES (
      ${data.fema_number}, ${data.common_name}, ${data.iupac_name ?? null},
      ${data.cas_id ?? null}, ${data.pubchem_id ?? null}, ${data.smile ?? null},
      ${data.inchi ?? null}, ${data.odor ?? null}, ${data.flavor_profile ?? null},
      ${data.fema_flavor_profile ?? null}, ${data.is_synthetic ?? null},
      ${data.is_natural ?? null}, ${data.molecular_weight ?? null},
      ${data.exact_mass ?? null}, ${data.unknown_natural ?? null},
      ${data.functional_groups ?? null}, ${data.xlogp ?? null}
    )
    RETURNING *
  `;

  return result[0];
}

// ===========================================
// REGULATORY STATUS
// ===========================================

import type {
  RegulatoryBody,
  RegulatoryStatusValue,
  RegulatoryStatus,
} from "@/app/type";

export async function getRegulatoryStatusBySubstance(
  substanceId: number
): Promise<RegulatoryStatus[]> {
  const result = await sql`
    SELECT * FROM regulatory_status
    WHERE substance_id = ${substanceId}
    ORDER BY regulatory_body
  `;
  return result as RegulatoryStatus[];
}

export async function getRegulatoryStatusByBody(
  regulatoryBody: RegulatoryBody,
  status?: RegulatoryStatusValue,
  page: number = 1,
  limit: number = 50
) {
  const offset = (page - 1) * limit;

  let results: Record<string, unknown>[];
  let totalCount: number;

  if (status) {
    results = await sql`
      SELECT rs.*, s.common_name, s.fema_number, s.cas_id
      FROM regulatory_status rs
      JOIN substance s ON rs.substance_id = s.substance_id
      WHERE rs.regulatory_body = ${regulatoryBody}
        AND rs.status = ${status}
      ORDER BY s.common_name
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countResult = await sql`
      SELECT COUNT(*) FROM regulatory_status
      WHERE regulatory_body = ${regulatoryBody} AND status = ${status}
    `;
    totalCount = parseInt(countResult[0].count as string);
  } else {
    results = await sql`
      SELECT rs.*, s.common_name, s.fema_number, s.cas_id
      FROM regulatory_status rs
      JOIN substance s ON rs.substance_id = s.substance_id
      WHERE rs.regulatory_body = ${regulatoryBody}
      ORDER BY s.common_name
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countResult = await sql`
      SELECT COUNT(*) FROM regulatory_status
      WHERE regulatory_body = ${regulatoryBody}
    `;
    totalCount = parseInt(countResult[0].count as string);
  }

  return {
    results,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    },
  };
}

export async function createRegulatoryStatus(data: {
  substance_id: number;
  regulatory_body: RegulatoryBody;
  status: RegulatoryStatusValue;
  max_usage_level?: string;
  reference_number?: string;
  reference_url?: string;
  effective_date?: string;
  expiry_date?: string;
  notes?: string;
}) {
  const result = await sql`
    INSERT INTO regulatory_status (
      substance_id, regulatory_body, status, max_usage_level,
      reference_number, reference_url, effective_date, expiry_date, notes
    )
    VALUES (
      ${data.substance_id}, ${data.regulatory_body}, ${data.status},
      ${data.max_usage_level ?? null}, ${data.reference_number ?? null},
      ${data.reference_url ?? null}, ${data.effective_date ?? null},
      ${data.expiry_date ?? null}, ${data.notes ?? null}
    )
    ON CONFLICT (substance_id, regulatory_body)
    DO UPDATE SET
      status = EXCLUDED.status,
      max_usage_level = EXCLUDED.max_usage_level,
      reference_number = EXCLUDED.reference_number,
      reference_url = EXCLUDED.reference_url,
      effective_date = EXCLUDED.effective_date,
      expiry_date = EXCLUDED.expiry_date,
      notes = EXCLUDED.notes,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

export async function deleteRegulatoryStatus(
  substanceId: number,
  regulatoryBody: RegulatoryBody
) {
  await sql`
    DELETE FROM regulatory_status
    WHERE substance_id = ${substanceId} AND regulatory_body = ${regulatoryBody}
  `;
}

// ===========================================
// USAGE GUIDELINES
// ===========================================

import type { ApplicationType, SubstanceUsageGuideline } from "@/app/type";

export async function getUsageGuidelinesBySubstance(
  substanceId: number
): Promise<SubstanceUsageGuideline[]> {
  const result = await sql`
    SELECT * FROM substance_usage_guideline
    WHERE substance_id = ${substanceId}
    ORDER BY application_type, application_subtype
  `;
  return result as SubstanceUsageGuideline[];
}

export async function getUsageGuidelinesByApplication(
  applicationType: ApplicationType,
  page: number = 1,
  limit: number = 50
) {
  const offset = (page - 1) * limit;

  const results = await sql`
    SELECT ug.*, s.common_name, s.fema_number, s.cas_id
    FROM substance_usage_guideline ug
    JOIN substance s ON ug.substance_id = s.substance_id
    WHERE ug.application_type = ${applicationType}
    ORDER BY s.common_name
    LIMIT ${limit} OFFSET ${offset}
  `;

  const countResult = await sql`
    SELECT COUNT(*) FROM substance_usage_guideline
    WHERE application_type = ${applicationType}
  `;
  const totalCount = parseInt(countResult[0].count as string);

  return {
    results,
    pagination: {
      total: totalCount,
      page,
      limit,
      pages: Math.ceil(totalCount / limit),
    },
  };
}

export async function createUsageGuideline(data: {
  substance_id: number;
  application_type: ApplicationType;
  application_subtype?: string;
  typical_min_ppm?: number;
  typical_max_ppm?: number;
  legal_max_ppm?: number;
  detection_threshold_ppm?: number;
  low_level_character?: string;
  high_level_character?: string;
  data_source?: string;
  source_reference?: string;
  notes?: string;
}) {
  const result = await sql`
    INSERT INTO substance_usage_guideline (
      substance_id, application_type, application_subtype,
      typical_min_ppm, typical_max_ppm, legal_max_ppm, detection_threshold_ppm,
      low_level_character, high_level_character,
      data_source, source_reference, notes
    )
    VALUES (
      ${data.substance_id}, ${data.application_type}, ${data.application_subtype ?? null},
      ${data.typical_min_ppm ?? null}, ${data.typical_max_ppm ?? null},
      ${data.legal_max_ppm ?? null}, ${data.detection_threshold_ppm ?? null},
      ${data.low_level_character ?? null}, ${data.high_level_character ?? null},
      ${data.data_source ?? null}, ${data.source_reference ?? null}, ${data.notes ?? null}
    )
    ON CONFLICT (substance_id, application_type, application_subtype)
    DO UPDATE SET
      typical_min_ppm = EXCLUDED.typical_min_ppm,
      typical_max_ppm = EXCLUDED.typical_max_ppm,
      legal_max_ppm = EXCLUDED.legal_max_ppm,
      detection_threshold_ppm = EXCLUDED.detection_threshold_ppm,
      low_level_character = EXCLUDED.low_level_character,
      high_level_character = EXCLUDED.high_level_character,
      data_source = EXCLUDED.data_source,
      source_reference = EXCLUDED.source_reference,
      notes = EXCLUDED.notes,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result[0];
}

export async function deleteUsageGuideline(guidelineId: number) {
  await sql`
    DELETE FROM substance_usage_guideline WHERE guideline_id = ${guidelineId}
  `;
}

// ===========================================
// SUBSTANCE WITH FULL RELATIONS
// ===========================================

export async function getSubstanceWithRelations(substanceId: number) {
  const substance = await sql`
    SELECT * FROM substance WHERE substance_id = ${substanceId}
  `;

  if (substance.length === 0) {
    throw new Error(`Substance not found with ID: ${substanceId}`);
  }

  // Fetch related data, gracefully handling missing tables
  let regulatoryStatuses: RegulatoryStatus[] = [];
  let usageGuidelines: SubstanceUsageGuideline[] = [];

  try {
    regulatoryStatuses = await getRegulatoryStatusBySubstance(substanceId);
  } catch {
    // Table may not exist yet
  }

  try {
    usageGuidelines = await getUsageGuidelinesBySubstance(substanceId);
  } catch {
    // Table may not exist yet
  }

  return {
    ...substance[0],
    regulatory_statuses: regulatoryStatuses,
    usage_guidelines: usageGuidelines,
  };
}

// ===========================================
// FUZZY SEARCH (requires pg_trgm extension)
// ===========================================

export async function searchSubstancesFuzzy(
  query: string,
  threshold: number = 0.3,
  limit: number = 20
) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const results = await sql`
    SELECT * FROM search_substances_fuzzy(${query}, ${threshold}, ${limit})
  `;

  return results;
}

// ===========================================
// RELATED SUBSTANCE VARIATIONS
// ===========================================

/**
 * Find related substance variations based on name.
 * This finds substances that are dilutions or variants of the base substance.
 * For example, "Vanillin" might have variations like "Vanillin 10%", "Vanillin IPM".
 */
export async function getRelatedSubstanceVariations(
  substanceId: number,
  limit: number = 10
): Promise<{
  substance_id: number;
  fema_number: number | null;
  common_name: string;
  cas_id: string | null;
  flavor_profile: string | null;
  odor: string | null;
}[]> {
  // First, get the source substance name
  const sourceResult = await sql`
    SELECT common_name FROM substance WHERE substance_id = ${substanceId}
  `;

  if (sourceResult.length === 0) {
    return [];
  }

  const sourceName = String(sourceResult[0].common_name);

  // Extract the base name (before any percentage or dilution info)
  // Pattern: "Vanillin 10% in DPG" -> "Vanillin"
  // Pattern: "Ethyl Vanillin IPM" -> "Ethyl Vanillin"
  const baseName = sourceName
    .replace(/\s*\d+%.*$/i, "") // Remove "10% in DPG" pattern
    .replace(/\s*(in\s+)?(DPG|TEC|IPM|PG|MCT|Triacetin).*$/i, "") // Remove solvent info
    .trim();

  if (baseName.length < 3) {
    return [];
  }

  // Find substances that:
  // 1. Have a name starting with the base name (variations like "Vanillin 10%")
  // 2. OR are the base substance of this one (if this is already a dilution)
  // Exclude the source substance itself
  const searchPattern = `${baseName}%`;

  const results = await sql`
    SELECT
      substance_id,
      fema_number,
      common_name,
      cas_id,
      flavor_profile,
      odor
    FROM substance
    WHERE substance_id != ${substanceId}
      AND (
        common_name ILIKE ${searchPattern}
        OR LOWER(${sourceName}) LIKE LOWER(common_name) || '%'
      )
    ORDER BY
      CASE
        WHEN LOWER(common_name) = LOWER(${baseName}) THEN 1
        ELSE 2
      END,
      common_name
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    substance_id: Number(r.substance_id),
    fema_number: r.fema_number != null ? Number(r.fema_number) : null,
    common_name: String(r.common_name),
    cas_id: r.cas_id ? String(r.cas_id) : null,
    flavor_profile: r.flavor_profile ? String(r.flavor_profile) : null,
    odor: r.odor ? String(r.odor) : null,
  }));
}
