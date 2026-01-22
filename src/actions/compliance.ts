"use server";

import {
  checkEUCompliance,
  ComplianceResult,
} from "@/lib/eu-compliance/checker";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

/**
 * Check EU compliance for a flavour
 * User must be owner or have shared access
 */
export async function checkFlavourEUCompliance(
  flavourId: number
): Promise<ComplianceResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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

  return checkEUCompliance(flavourId);
}

// Re-export types for convenience
export type { ComplianceResult, ComplianceIssue } from "@/lib/eu-compliance/checker";
