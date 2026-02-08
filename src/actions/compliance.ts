"use server";

import {
  checkEUCompliance,
  ComplianceResult,
} from "@/lib/eu-compliance/checker";
import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Check EU compliance for a formula
 * User must be owner or have shared access
 */
export async function checkFormulaEUCompliance(
  formulaId: number
): Promise<ComplianceResult> {
  const userId = await getUserId();

  // Check user has access to this formula
  const accessCheck = await sql`
    SELECT f.formula_id
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Forbidden: You do not have access to this formula");
  }

  const result = await checkEUCompliance(formulaId);

  // Track compliance check in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "compliance_check_run",
    properties: {
      formula_id: formulaId,
      is_compliant: result.isCompliant,
      issue_count: result.issues?.length ?? 0,
      region: "EU",
    },
  });

  return result;
}

// Re-export types for convenience
export type { ComplianceResult, ComplianceIssue } from "@/lib/eu-compliance/checker";
