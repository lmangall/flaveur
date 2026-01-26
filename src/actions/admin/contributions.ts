"use server";

import { getSession, getUser } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import type { Substance, SubstanceFeedback } from "@/app/type";
import type {
  VerificationStatusValue,
  FeedbackStatusValue,
} from "@/constants";

// Admin email whitelist - in production, use a proper admin role system
const ADMIN_EMAILS = ["l.mangallon@gmail.com"];

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const email = session.user.email;

  if (!email || !ADMIN_EMAILS.includes(email)) {
    throw new Error("Forbidden: Admin access required");
  }

  return { userId: session.user.id, email };
}

// ===========================================
// PENDING SUBSTANCES
// ===========================================

export type PendingSubstanceWithUser = Substance & {
  submitter_username?: string;
  submitter_email?: string;
};

/**
 * Get substances pending review (user_entry or under_review)
 */
export async function getPendingSubstances(
  status?: "user_entry" | "under_review"
): Promise<PendingSubstanceWithUser[]> {
  await requireAdmin();

  let result;
  if (status) {
    result = await sql`
      SELECT s.*, u.username as submitter_username, u.email as submitter_email
      FROM substance s
      LEFT JOIN "user" u ON s.submitted_by_user_id = u.user_id
      WHERE s.verification_status = ${status}
      ORDER BY s.submitted_at DESC
    `;
  } else {
    result = await sql`
      SELECT s.*, u.username as submitter_username, u.email as submitter_email
      FROM substance s
      LEFT JOIN "user" u ON s.submitted_by_user_id = u.user_id
      WHERE s.verification_status != 'verified'
      ORDER BY s.submitted_at DESC
    `;
  }

  return result as PendingSubstanceWithUser[];
}

/**
 * Get a specific substance for admin review
 */
export async function getSubstanceForReview(
  substanceId: number
): Promise<PendingSubstanceWithUser | null> {
  await requireAdmin();

  const result = await sql`
    SELECT s.*, u.username as submitter_username, u.email as submitter_email
    FROM substance s
    LEFT JOIN "user" u ON s.submitted_by_user_id = u.user_id
    WHERE s.substance_id = ${substanceId}
  `;

  if (result.length === 0) return null;
  return result[0] as PendingSubstanceWithUser;
}

/**
 * Mark a substance as under review
 */
export async function markSubstanceUnderReview(
  substanceId: number,
  adminNotes?: string
): Promise<Substance> {
  const { email } = await requireAdmin();

  const result = await sql`
    UPDATE substance SET
      verification_status = 'under_review',
      reviewed_by_admin_email = ${email},
      admin_notes = ${adminNotes ?? null},
      updated_at = CURRENT_TIMESTAMP
    WHERE substance_id = ${substanceId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Substance not found");
  }

  return result[0] as Substance;
}

/**
 * Verify a substance (approve it as official)
 */
export async function verifySubstance(
  substanceId: number,
  adminNotes?: string
): Promise<Substance> {
  const { email } = await requireAdmin();

  const result = await sql`
    UPDATE substance SET
      verification_status = 'verified',
      reviewed_by_admin_email = ${email},
      reviewed_at = CURRENT_TIMESTAMP,
      admin_notes = ${adminNotes ?? null},
      updated_at = CURRENT_TIMESTAMP
    WHERE substance_id = ${substanceId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Substance not found");
  }

  return result[0] as Substance;
}

/**
 * Update substance fields and optionally verify
 */
export async function updateAndVerifySubstance(
  substanceId: number,
  updates: Partial<{
    common_name: string;
    cas_id: string;
    fema_number: number;
    pubchem_id: number;
    iupac_name: string;
    odor: string;
    taste: string;
    flavor_profile: string;
    description: string;
    is_natural: boolean;
    synthetic: boolean;
    molecular_formula: string;
    molecular_weight: number;
    smile: string;
    inchi: string;
  }>,
  verify: boolean = true,
  adminNotes?: string
): Promise<Substance> {
  const { email } = await requireAdmin();

  // Build dynamic update
  const existing = await sql`SELECT * FROM substance WHERE substance_id = ${substanceId}`;
  if (existing.length === 0) throw new Error("Substance not found");

  const current = existing[0];
  const newStatus: VerificationStatusValue = verify ? "verified" : current.verification_status;

  const result = await sql`
    UPDATE substance SET
      common_name = ${updates.common_name ?? current.common_name},
      cas_id = ${updates.cas_id !== undefined ? updates.cas_id : current.cas_id},
      fema_number = ${updates.fema_number !== undefined ? updates.fema_number : current.fema_number},
      pubchem_id = ${updates.pubchem_id !== undefined ? updates.pubchem_id : current.pubchem_id},
      iupac_name = ${updates.iupac_name !== undefined ? updates.iupac_name : current.iupac_name},
      odor = ${updates.odor !== undefined ? updates.odor : current.odor},
      taste = ${updates.taste !== undefined ? updates.taste : current.taste},
      flavor_profile = ${updates.flavor_profile !== undefined ? updates.flavor_profile : current.flavor_profile},
      description = ${updates.description !== undefined ? updates.description : current.description},
      is_natural = ${updates.is_natural !== undefined ? updates.is_natural : current.is_natural},
      synthetic = ${updates.synthetic !== undefined ? updates.synthetic : current.synthetic},
      molecular_formula = ${updates.molecular_formula !== undefined ? updates.molecular_formula : current.molecular_formula},
      molecular_weight = ${updates.molecular_weight !== undefined ? updates.molecular_weight : current.molecular_weight},
      smile = ${updates.smile !== undefined ? updates.smile : current.smile},
      inchi = ${updates.inchi !== undefined ? updates.inchi : current.inchi},
      verification_status = ${newStatus},
      reviewed_by_admin_email = ${email},
      reviewed_at = ${verify ? sql`CURRENT_TIMESTAMP` : current.reviewed_at},
      admin_notes = ${adminNotes ?? current.admin_notes},
      updated_at = CURRENT_TIMESTAMP
    WHERE substance_id = ${substanceId}
    RETURNING *
  `;

  return result[0] as Substance;
}

/**
 * Reject a substance - removes it from the system and from all flavours using it
 */
export async function rejectSubstance(
  substanceId: number,
  reason: string
): Promise<{ success: boolean; removedFromFlavours: number }> {
  const { email } = await requireAdmin();

  if (!reason || reason.trim().length < 5) {
    throw new Error("Rejection reason must be at least 5 characters");
  }

  // Check substance exists
  const existing = await sql`SELECT * FROM substance WHERE substance_id = ${substanceId}`;
  if (existing.length === 0) throw new Error("Substance not found");

  // Count flavours using this substance
  const flavoursUsingIt = await sql`
    SELECT COUNT(*)::int as count FROM substance_flavour WHERE substance_id = ${substanceId}
  `;
  const removedFromFlavours = (flavoursUsingIt[0] as { count: number }).count;

  // Remove from all flavours first (cascade would handle this, but let's be explicit)
  await sql`DELETE FROM substance_flavour WHERE substance_id = ${substanceId}`;

  // Delete the substance
  await sql`DELETE FROM substance WHERE substance_id = ${substanceId}`;

  console.log(
    `[Admin] ${email} rejected substance ${substanceId}. Reason: ${reason}. Removed from ${removedFromFlavours} flavours.`
  );

  return { success: true, removedFromFlavours };
}

// ===========================================
// FEEDBACK MANAGEMENT
// ===========================================

export type FeedbackWithDetails = SubstanceFeedback & {
  substance_name: string;
  submitter_username?: string;
  submitter_email?: string;
};

/**
 * Get all pending feedback
 */
export async function getPendingFeedback(
  status?: FeedbackStatusValue
): Promise<FeedbackWithDetails[]> {
  await requireAdmin();

  let result;
  if (status) {
    result = await sql`
      SELECT sf.*, s.common_name as substance_name,
             u.username as submitter_username, u.email as submitter_email
      FROM substance_feedback sf
      JOIN substance s ON sf.substance_id = s.substance_id
      LEFT JOIN "user" u ON sf.submitted_by_user_id = u.user_id
      WHERE sf.status = ${status}
      ORDER BY sf.submitted_at DESC
    `;
  } else {
    result = await sql`
      SELECT sf.*, s.common_name as substance_name,
             u.username as submitter_username, u.email as submitter_email
      FROM substance_feedback sf
      JOIN substance s ON sf.substance_id = s.substance_id
      LEFT JOIN "user" u ON sf.submitted_by_user_id = u.user_id
      WHERE sf.status IN ('pending', 'under_review')
      ORDER BY sf.submitted_at DESC
    `;
  }

  return result as FeedbackWithDetails[];
}

/**
 * Get a specific feedback for review
 */
export async function getFeedbackForReview(
  feedbackId: number
): Promise<FeedbackWithDetails | null> {
  await requireAdmin();

  const result = await sql`
    SELECT sf.*, s.common_name as substance_name,
           u.username as submitter_username, u.email as submitter_email
    FROM substance_feedback sf
    JOIN substance s ON sf.substance_id = s.substance_id
    LEFT JOIN "user" u ON sf.submitted_by_user_id = u.user_id
    WHERE sf.feedback_id = ${feedbackId}
  `;

  if (result.length === 0) return null;
  return result[0] as FeedbackWithDetails;
}

/**
 * Update feedback status
 */
export async function updateFeedbackStatus(
  feedbackId: number,
  status: FeedbackStatusValue,
  adminNotes?: string,
  resolution?: string
): Promise<SubstanceFeedback> {
  const { email } = await requireAdmin();

  const result = await sql`
    UPDATE substance_feedback SET
      status = ${status},
      reviewed_by_admin_email = ${email},
      admin_notes = ${adminNotes ?? null},
      resolution = ${resolution ?? null},
      updated_at = CURRENT_TIMESTAMP
    WHERE feedback_id = ${feedbackId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Feedback not found");
  }

  return result[0] as SubstanceFeedback;
}

/**
 * Resolve feedback and optionally apply the suggested change
 */
export async function resolveFeedbackWithChange(
  feedbackId: number,
  applyChange: boolean,
  resolution: string,
  adminNotes?: string
): Promise<{ feedback: SubstanceFeedback; substanceUpdated: boolean }> {
  const { email } = await requireAdmin();

  // Get the feedback
  const feedbackResult = await sql`
    SELECT * FROM substance_feedback WHERE feedback_id = ${feedbackId}
  `;
  if (feedbackResult.length === 0) throw new Error("Feedback not found");

  const feedback = feedbackResult[0] as SubstanceFeedback;
  let substanceUpdated = false;

  // Apply the change if requested and there's a target field + suggested value
  if (
    applyChange &&
    feedback.target_field &&
    feedback.suggested_value !== null
  ) {
    // Dynamic field update - only allow specific known fields
    const allowedFields = [
      "common_name",
      "cas_id",
      "fema_number",
      "pubchem_id",
      "iupac_name",
      "odor",
      "taste",
      "flavor_profile",
      "description",
      "molecular_formula",
      "smile",
      "inchi",
    ];

    if (allowedFields.includes(feedback.target_field)) {
      // Use switch to safely update dynamic field with parameterized values
      const field = feedback.target_field;
      const value = feedback.suggested_value;
      const substanceId = feedback.substance_id;

      switch (field) {
        case "common_name":
          await sql`UPDATE substance SET common_name = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "cas_id":
          await sql`UPDATE substance SET cas_id = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "fema_number":
          await sql`UPDATE substance SET fema_number = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "pubchem_id":
          await sql`UPDATE substance SET pubchem_id = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "iupac_name":
          await sql`UPDATE substance SET iupac_name = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "odor":
          await sql`UPDATE substance SET odor = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "taste":
          await sql`UPDATE substance SET taste = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "flavor_profile":
          await sql`UPDATE substance SET flavor_profile = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "description":
          await sql`UPDATE substance SET description = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "molecular_formula":
          await sql`UPDATE substance SET molecular_formula = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "smile":
          await sql`UPDATE substance SET smile = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
        case "inchi":
          await sql`UPDATE substance SET inchi = ${value}, updated_at = CURRENT_TIMESTAMP WHERE substance_id = ${substanceId}`;
          break;
      }
      substanceUpdated = true;
    }
  }

  // Update the feedback status
  const updatedFeedback = await sql`
    UPDATE substance_feedback SET
      status = 'resolved',
      reviewed_by_admin_email = ${email},
      admin_notes = ${adminNotes ?? null},
      resolution = ${resolution},
      updated_at = CURRENT_TIMESTAMP
    WHERE feedback_id = ${feedbackId}
    RETURNING *
  `;

  return {
    feedback: updatedFeedback[0] as SubstanceFeedback,
    substanceUpdated,
  };
}

// ===========================================
// CONTRIBUTION STATS
// ===========================================

export interface ContributionStats {
  submissions: {
    total: number;
    pending: number;
    under_review: number;
    verified: number;
  };
  feedback: {
    total: number;
    pending: number;
    under_review: number;
    resolved: number;
    rejected: number;
  };
  topContributors: Array<{
    user_id: string;
    username: string;
    submissions: number;
    verified: number;
  }>;
}

/**
 * Get contribution statistics for admin dashboard
 */
export async function getContributionStats(): Promise<ContributionStats> {
  await requireAdmin();

  // Submission counts
  const [submissionStats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE submitted_by_user_id IS NOT NULL)::int as total,
      COUNT(*) FILTER (WHERE verification_status = 'user_entry')::int as pending,
      COUNT(*) FILTER (WHERE verification_status = 'under_review')::int as under_review,
      COUNT(*) FILTER (WHERE verification_status = 'verified' AND submitted_by_user_id IS NOT NULL)::int as verified
    FROM substance
  `;

  // Feedback counts
  const [feedbackStats] = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
      COUNT(*) FILTER (WHERE status = 'under_review')::int as under_review,
      COUNT(*) FILTER (WHERE status = 'resolved')::int as resolved,
      COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected
    FROM substance_feedback
  `;

  // Top contributors
  const topContributors = await sql`
    SELECT
      s.submitted_by_user_id as user_id,
      u.username,
      COUNT(*)::int as submissions,
      COUNT(*) FILTER (WHERE s.verification_status = 'verified')::int as verified
    FROM substance s
    JOIN "user" u ON s.submitted_by_user_id = u.user_id
    WHERE s.submitted_by_user_id IS NOT NULL
    GROUP BY s.submitted_by_user_id, u.username
    ORDER BY submissions DESC
    LIMIT 10
  `;

  return {
    submissions: submissionStats as ContributionStats["submissions"],
    feedback: feedbackStats as ContributionStats["feedback"],
    topContributors: topContributors as ContributionStats["topContributors"],
  };
}
