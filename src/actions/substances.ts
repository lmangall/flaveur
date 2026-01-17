"use server";

import { sql } from "@/lib/db";

export async function getSubstances(page: number = 1) {
  const limit = 10;
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
  limit: number = 10
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
      results = await sql`
        SELECT * FROM substance
        WHERE common_name ILIKE ${searchTerm}
        OR alternative_names::text ILIKE ${searchTerm}
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
      results = await sql`
        SELECT * FROM substance
        WHERE olfactory_taste_notes ILIKE ${searchTerm}
        OR flavor_profile ILIKE ${searchTerm}
        OR fema_flavor_profile ILIKE ${searchTerm}
        OR taste ILIKE ${searchTerm}
        OR odor ILIKE ${searchTerm}
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
      results = await sql`
        SELECT * FROM substance
        WHERE cas_id ILIKE ${searchTerm}
        LIMIT ${limit} OFFSET ${offset}
      `;
      const casCount = await sql`
        SELECT COUNT(*) FROM substance WHERE cas_id ILIKE ${searchTerm}
      `;
      totalResults = parseInt(casCount[0].count as string);
      break;

    case "fema_number":
      results = await sql`
        SELECT * FROM substance
        WHERE fema_number::text ILIKE ${searchTerm}
        LIMIT ${limit} OFFSET ${offset}
      `;
      const femaCount = await sql`
        SELECT COUNT(*) FROM substance WHERE fema_number::text ILIKE ${searchTerm}
      `;
      totalResults = parseInt(femaCount[0].count as string);
      break;

    case "all":
    default:
      results = await sql`
        SELECT * FROM substance
        WHERE common_name ILIKE ${searchTerm}
        OR alternative_names::text ILIKE ${searchTerm}
        OR olfactory_taste_notes ILIKE ${searchTerm}
        OR flavor_profile ILIKE ${searchTerm}
        OR fema_flavor_profile ILIKE ${searchTerm}
        OR taste ILIKE ${searchTerm}
        OR cas_id ILIKE ${searchTerm}
        OR description ILIKE ${searchTerm}
        OR odor ILIKE ${searchTerm}
        OR common_applications ILIKE ${searchTerm}
        LIMIT ${limit} OFFSET ${offset}
      `;
      const allCount = await sql`
        SELECT COUNT(*) FROM substance
        WHERE common_name ILIKE ${searchTerm}
        OR alternative_names::text ILIKE ${searchTerm}
        OR olfactory_taste_notes ILIKE ${searchTerm}
        OR flavor_profile ILIKE ${searchTerm}
        OR fema_flavor_profile ILIKE ${searchTerm}
        OR taste ILIKE ${searchTerm}
        OR cas_id ILIKE ${searchTerm}
        OR description ILIKE ${searchTerm}
        OR odor ILIKE ${searchTerm}
        OR common_applications ILIKE ${searchTerm}
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
