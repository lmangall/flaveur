"use server";

import { sql } from "@/lib/db";
import { getUserId } from "@/lib/auth-server";

export interface DataQualityMetrics {
  totals: {
    total: number;
    with_cas: number;
    with_fema: number;
    with_fl_number: number;
    with_eu_policy_code: number;
    with_smiles: number;
    with_mol_weight: number;
    with_inchi: number;
    with_flavor_profile: number;
    natural_count: number;
    synthetic_count: number;
  };
  functionalGroups: {
    substances_with_groups: number;
    total_groups: number;
  };
  missing: {
    missing_smiles: number;
    missing_cas: number;
    missing_fl_number: number;
    missing_eu_policy_code: number;
    missing_inchi: number;
    missing_mol_weight: number;
  };
  completenessScore: number;
}

export async function getDataQualityMetrics(): Promise<DataQualityMetrics> {
  const userId = await getUserId();

  const [metrics] = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(NULLIF(cas_id, ''))::int as with_cas,
      COUNT(NULLIF(fema_number, 0))::int as with_fema,
      COUNT(NULLIF(fl_number, ''))::int as with_fl_number,
      COUNT(NULLIF(eu_policy_code, ''))::int as with_eu_policy_code,
      COUNT(NULLIF(smile, ''))::int as with_smiles,
      COUNT(*) FILTER (WHERE molecular_weight IS NOT NULL AND molecular_weight != 0)::int as with_mol_weight,
      COUNT(NULLIF(inchi, ''))::int as with_inchi,
      COUNT(NULLIF(flavor_profile, ''))::int as with_flavor_profile,
      COUNT(*) FILTER (WHERE is_natural = true)::int as natural_count,
      COUNT(*) FILTER (WHERE synthetic = true)::int as synthetic_count
    FROM substance
  `;

  // Check if functional_group table exists before querying
  let functionalGroupCoverage = { substances_with_groups: 0, total_groups: 0 };
  try {
    const fgResult = await sql`
      SELECT
        COUNT(DISTINCT sfg.substance_id)::int as substances_with_groups,
        COUNT(DISTINCT fg.functional_group_id)::int as total_groups
      FROM functional_group fg
      LEFT JOIN substance_functional_group sfg ON fg.functional_group_id = sfg.functional_group_id
    `;
    functionalGroupCoverage = fgResult[0] as typeof functionalGroupCoverage;
  } catch {
    // Tables don't exist yet - will be created by migration 013
  }

  const [topMissingFields] = await sql`
    SELECT
      SUM(CASE WHEN smile IS NULL OR smile = '' THEN 1 ELSE 0 END)::int as missing_smiles,
      SUM(CASE WHEN cas_id IS NULL OR cas_id = '' THEN 1 ELSE 0 END)::int as missing_cas,
      SUM(CASE WHEN fl_number IS NULL OR fl_number = '' THEN 1 ELSE 0 END)::int as missing_fl_number,
      SUM(CASE WHEN eu_policy_code IS NULL OR eu_policy_code = '' THEN 1 ELSE 0 END)::int as missing_eu_policy_code,
      SUM(CASE WHEN inchi IS NULL OR inchi = '' THEN 1 ELSE 0 END)::int as missing_inchi,
      SUM(CASE WHEN molecular_weight IS NULL THEN 1 ELSE 0 END)::int as missing_mol_weight
    FROM substance
  `;

  const total = metrics.total as number;
  const withCas = metrics.with_cas as number;
  const withSmiles = metrics.with_smiles as number;
  const withMolWeight = metrics.with_mol_weight as number;
  const withInchi = metrics.with_inchi as number;

  const completenessScore =
    total > 0
      ? Math.round(
          ((withCas + withSmiles + withMolWeight + withInchi) / (total * 4)) *
            100
        )
      : 0;

  return {
    totals: metrics as DataQualityMetrics["totals"],
    functionalGroups: functionalGroupCoverage,
    missing: topMissingFields as DataQualityMetrics["missing"],
    completenessScore,
  };
}
