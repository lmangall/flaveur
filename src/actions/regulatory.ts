"use server";

import {
  getEUComplianceData,
  getEUAdditiveFullData,
  type EUAdditiveFullData,
} from "@/lib/eu-api/client";

export interface SubstanceEUStatus {
  found: boolean;
  status: "approved" | "restricted" | "not_found";
  name?: string;
  eNumber?: string;
  restrictions?: {
    type: string | null;
    value: number | null;
    unit: string | null;
    comment: string | null;
    foodCategory: string;
  }[];
  legislation?: string;
  detailsUrl?: string;
}

/**
 * Get EU regulatory status for a single substance
 * Tries common name first, then alternative names
 */
export async function getSubstanceEUStatus(
  chemicalName: string,
  alternativeNames?: string[]
): Promise<SubstanceEUStatus> {
  try {
    // Try common name first
    let euData = await getEUComplianceData(chemicalName);

    // Try alternative names if not found
    if (!euData && alternativeNames?.length) {
      for (const altName of alternativeNames) {
        if (typeof altName === "string" && altName.trim()) {
          euData = await getEUComplianceData(altName);
          if (euData) break;
        }
      }
    }

    if (!euData) {
      return { found: false, status: "not_found" };
    }

    return {
      found: true,
      status: euData.isRestricted ? "restricted" : "approved",
      name: euData.name,
      eNumber: euData.eNumber,
      restrictions: euData.restrictions,
      legislation: euData.legislation,
      detailsUrl: euData.detailsUrl,
    };
  } catch (error) {
    console.error("Error in getSubstanceEUStatus:", error);
    return { found: false, status: "not_found" };
  }
}

/**
 * Batch lookup for multiple substances (efficient - single API fetch)
 */
export async function getSubstancesEUStatus(
  substances: { id: number; name: string; alternativeNames?: string[] }[]
): Promise<Map<number, SubstanceEUStatus>> {
  const results = new Map<number, SubstanceEUStatus>();

  // All lookups share the same cached EU data (24h cache)
  for (const sub of substances) {
    const status = await getSubstanceEUStatus(sub.name, sub.alternativeNames);
    results.set(sub.id, status);
  }

  return results;
}

/**
 * Get full detailed EU data for modal display
 * Includes all food categories, legislation details, synonyms, etc.
 */
export async function getSubstanceEUFullData(
  chemicalName: string,
  alternativeNames?: string[]
): Promise<EUAdditiveFullData | null> {
  try {
    // Try common name first
    let data = await getEUAdditiveFullData(chemicalName);

    // Try alternative names if not found
    if (!data && alternativeNames?.length) {
      for (const altName of alternativeNames) {
        if (typeof altName === "string" && altName.trim()) {
          data = await getEUAdditiveFullData(altName);
          if (data) break;
        }
      }
    }

    return data;
  } catch (error) {
    console.error("Error in getSubstanceEUFullData:", error);
    return null;
  }
}
