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
  formulaId: number;
  formulaName: string;
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
 * Check EU compliance for a formula formulation
 */
export async function checkEUCompliance(
  formulaId: number
): Promise<ComplianceResult> {
  // Get formula info
  const formulaResult = await sql`
    SELECT formula_id, name FROM formula WHERE formula_id = ${formulaId}
  `;

  if (formulaResult.length === 0) {
    throw new Error("Formula not found");
  }

  const formula = formulaResult[0];

  // Get all substances in the formulation with concentrations
  const substances = await sql`
    SELECT
      sf.substance_id,
      sf.concentration,
      sf.unit,
      s.common_name,
      s.alternative_names
    FROM substance_formula sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.formula_id = ${formulaId}
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
        message: "Not found in EU Food Flavourings or Additives databases",
      });
      continue;
    }

    if (!euData.isRestricted) {
      approved++;
      continue;
    }

    // Check restrictions - group by severity to avoid duplicate entries
    const usedPpm = convertToPpm(
      sub.concentration as number | null,
      sub.unit as string | null
    );

    const exceededCategories: string[] = [];
    const withinLimitCategories: string[] = [];
    const qualitativeCategories: string[] = [];
    let minMaxPpm: number | null = null;

    for (const restriction of euData.restrictions) {
      if (restriction.value && usedPpm) {
        const maxPpm = convertRestrictionToPpm(
          restriction.value,
          restriction.unit
        );

        if (maxPpm && usedPpm > maxPpm) {
          exceededCategories.push(restriction.foodCategory);
          if (minMaxPpm === null || maxPpm < minMaxPpm) {
            minMaxPpm = maxPpm;
          }
        } else {
          withinLimitCategories.push(restriction.foodCategory);
        }
      } else if (restriction.type) {
        qualitativeCategories.push(restriction.foodCategory);
      }
    }

    // Create one issue per severity level (grouped)
    if (exceededCategories.length > 0) {
      issues.push({
        substanceId: sub.substance_id as number,
        substanceName: sub.common_name as string,
        severity: "error",
        type: "exceeds_limit",
        message: `Exceeds EU limit: ${usedPpm?.toFixed(1)} ppm used, max ${minMaxPpm} ppm allowed in ${exceededCategories.length} food ${exceededCategories.length === 1 ? "category" : "categories"}`,
        details: {
          usedPpm: usedPpm ?? undefined,
          maxPpm: minMaxPpm ?? undefined,
          foodCategory: exceededCategories.join(", "),
        },
        euUrl: euData.detailsUrl,
      });
    }

    if (withinLimitCategories.length > 0) {
      issues.push({
        substanceId: sub.substance_id as number,
        substanceName: sub.common_name as string,
        severity: "info",
        type: "restricted",
        message: `Restricted in EU (within limits for ${withinLimitCategories.length} food ${withinLimitCategories.length === 1 ? "category" : "categories"})`,
        details: {
          usedPpm: usedPpm ?? undefined,
          foodCategory: withinLimitCategories.slice(0, 3).join(", ") + (withinLimitCategories.length > 3 ? ` (+${withinLimitCategories.length - 3} more)` : ""),
        },
        euUrl: euData.detailsUrl,
      });
    }

    if (qualitativeCategories.length > 0) {
      issues.push({
        substanceId: sub.substance_id as number,
        substanceName: sub.common_name as string,
        severity: "warning",
        type: "category_restriction",
        message: `EU restriction applies to ${qualitativeCategories.length} food ${qualitativeCategories.length === 1 ? "category" : "categories"}`,
        details: {
          foodCategory: qualitativeCategories.slice(0, 3).join(", ") + (qualitativeCategories.length > 3 ? ` (+${qualitativeCategories.length - 3} more)` : ""),
        },
        euUrl: euData.detailsUrl,
      });
    }
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  return {
    formulaId,
    formulaName: formula.name as string,
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
