"use server";

import {
  checkEUCompliance,
  ComplianceResult,
} from "@/lib/eu-compliance/checker";
import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { getPostHogClient } from "@/lib/posthog-server";

/**
 * Check EU compliance for a flavour
 * User must be owner or have shared access
 */
export async function checkFlavourEUCompliance(
  flavourId: number
): Promise<ComplianceResult> {
  const userId = await getUserId();

  // Check user has access to this flavour
  const accessCheck = await sql`
    SELECT f.flavour_id
    FROM flavour f
    LEFT JOIN flavour_shares fs ON f.flavour_id = fs.flavour_id
      AND fs.shared_with_user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Forbidden: You do not have access to this flavour");
  }

  const result = await checkEUCompliance(flavourId);

  // Track compliance check in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "compliance_check_run",
    properties: {
      flavour_id: flavourId,
      is_compliant: result.isCompliant,
      issue_count: result.issues?.length ?? 0,
      region: "EU",
    },
  });

  return result;
}

// Re-export types for convenience
export type { ComplianceResult, ComplianceIssue } from "@/lib/eu-compliance/checker";
