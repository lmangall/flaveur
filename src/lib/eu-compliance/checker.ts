import { getEUComplianceData } from "@/lib/eu-api/client";
import { sql } from "@/lib/db";

export interface ComplianceIssue {
  substanceId: number;
  substanceName: string;
  severity: "error" | "warning" | "info";
  type:
    | "not_found"
    | "restricted"
    | "exceeds_limit"
    | "category_restriction";
  message: string;
  details?: {
    usedPpm?: number;
    maxPpm?: number;
    restriction?: string;
    foodCategory?: string;
  };
  euUrl?: string;
}

export interface ComplianceResult {
  flavourId: number;
  flavourName: string;
  isCompliant: boolean;
  checkedAt: string;
  totalSubstances: number;
  issues: ComplianceIssue[];
  summary: {
    errors: number;
    warnings: number;
    notFound: number;
    approved: number;
  };
}

/**
 * Check EU compliance for a flavour formulation
 */
export async function checkEUCompliance(
  flavourId: number
): Promise<ComplianceResult> {
  // Get flavour info
  const flavourResult = await sql`
    SELECT flavour_id, name FROM flavour WHERE flavour_id = ${flavourId}
  `;

  if (flavourResult.length === 0) {
    throw new Error("Flavour not found");
  }

  const flavour = flavourResult[0];

  // Get all substances in the formulation with concentrations
  const substances = await sql`
    SELECT
      sf.substance_id,
      sf.concentration,
      sf.unit,
      s.common_name,
      s.alternative_names
    FROM substance_flavour sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.flavour_id = ${flavourId}
  `;

  const issues: ComplianceIssue[] = [];
  let approved = 0;
  let notFound = 0;

  for (const sub of substances) {
    // Try to find EU data by common name first
    let euData = await getEUComplianceData(sub.common_name as string);

    // Try alternative names if not found
    if (!euData && sub.alternative_names) {
      // Handle JSONB that may come as string or already-parsed array
      let altNames: string[];
      if (typeof sub.alternative_names === "string") {
        try {
          altNames = JSON.parse(sub.alternative_names);
        } catch {
          altNames = [];
        }
      } else if (Array.isArray(sub.alternative_names)) {
        altNames = sub.alternative_names;
      } else {
        altNames = [];
      }

      for (const altName of altNames) {
        euData = await getEUComplianceData(String(altName));
        if (euData) break;
      }
    }

    if (!euData) {
      notFound++;
      issues.push({
        substanceId: sub.substance_id as number,
        substanceName: sub.common_name as string,
        severity: "warning",
        type: "not_found",
        message: "Not found in EU Food Additives database",
      });
      continue;
    }

    if (!euData.isRestricted) {
      approved++;
      continue;
    }

    // Check restrictions
    const usedPpm = convertToPpm(
      sub.concentration as number | null,
      sub.unit as string | null
    );

    for (const restriction of euData.restrictions) {
      if (restriction.value && usedPpm) {
        const maxPpm = convertRestrictionToPpm(
          restriction.value,
          restriction.unit
        );

        if (maxPpm && usedPpm > maxPpm) {
          issues.push({
            substanceId: sub.substance_id as number,
            substanceName: sub.common_name as string,
            severity: "error",
            type: "exceeds_limit",
            message: `Exceeds EU limit: ${usedPpm.toFixed(1)} ppm used, max ${maxPpm} ppm allowed`,
            details: {
              usedPpm,
              maxPpm,
              foodCategory: restriction.foodCategory,
            },
            euUrl: euData.detailsUrl,
          });
        } else {
          // Under limit but restricted - info only
          issues.push({
            substanceId: sub.substance_id as number,
            substanceName: sub.common_name as string,
            severity: "info",
            type: "restricted",
            message: "Restricted in EU (within limits)",
            details: {
              usedPpm,
              maxPpm: maxPpm ?? undefined,
              restriction: restriction.comment || undefined,
              foodCategory: restriction.foodCategory,
            },
            euUrl: euData.detailsUrl,
          });
        }
      } else if (restriction.type) {
        // Qualitative restriction (no numeric limit)
        issues.push({
          substanceId: sub.substance_id as number,
          substanceName: sub.common_name as string,
          severity: "warning",
          type: "category_restriction",
          message: `EU restriction: ${restriction.type}`,
          details: {
            restriction: restriction.comment || restriction.type,
            foodCategory: restriction.foodCategory,
          },
          euUrl: euData.detailsUrl,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  return {
    flavourId,
    flavourName: flavour.name as string,
    isCompliant: errors === 0,
    checkedAt: new Date().toISOString(),
    totalSubstances: substances.length,
    issues,
    summary: {
      errors,
      warnings,
      notFound,
      approved,
    },
  };
}

function convertToPpm(
  concentration: number | null,
  unit: string | null
): number | null {
  if (!concentration || !unit) return null;

  switch (unit.toLowerCase()) {
    case "ppm":
      return concentration;
    case "g/kg":
      return concentration * 1000;
    case "%(v/v)":
    case "%":
      return concentration * 10000;
    case "g/l":
    case "g/L":
      return concentration * 1000;
    case "mg/kg":
      return concentration;
    case "ml/l":
    case "mL/L":
      return concentration * 1000; // Approximate
    default:
      return concentration;
  }
}

function convertRestrictionToPpm(
  value: number,
  unit: string | null
): number | null {
  if (!unit) return value; // Assume ppm if no unit

  switch (unit.toLowerCase()) {
    case "mg/kg":
    case "ppm":
      return value;
    case "g/kg":
      return value * 1000;
    case "%":
      return value * 10000;
    default:
      return value;
  }
}
