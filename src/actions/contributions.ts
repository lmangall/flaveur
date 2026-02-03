"use server";

import { getUserId, getSession } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import type { Substance, SubstanceFeedback } from "@/app/type";
import type { FeedbackTypeValue } from "@/constants";
import { sendNewSubmissionNotification, sendNewFeedbackNotification } from "@/lib/email/resend";
import { getPostHogClient } from "@/lib/posthog-server";

// ===========================================
// DUPLICATE CHECKING
// ===========================================

/**
 * Check if a substance name already exists (case-insensitive)
 * Also checks alternative_names JSONB array
 */
export async function checkDuplicateSubstance(name: string): Promise<{
  exists: boolean;
  matchedSubstance?: Partial<Substance>;
  matchType?: "common_name" | "alternative_name";
}> {
  if (!name || name.trim().length < 2) {
    return { exists: false };
  }

  const normalizedName = name.trim().toLowerCase();

  // Check exact match on common_name
  const commonNameMatch = await sql`
    SELECT substance_id, common_name, cas_id, fema_number, verification_status
    FROM substance
    WHERE LOWER(common_name) = ${normalizedName}
    LIMIT 1
  `;

  if (commonNameMatch.length > 0) {
    return {
      exists: true,
      matchedSubstance: commonNameMatch[0] as Partial<Substance>,
      matchType: "common_name",
    };
  }

  // Check alternative_names JSONB array (case-insensitive)
  const altNameMatch = await sql`
    SELECT substance_id, common_name, cas_id, fema_number, alternative_names, verification_status
    FROM substance
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(alternative_names) AS alt_name
      WHERE LOWER(alt_name) = ${normalizedName}
    )
    LIMIT 1
  `;

  if (altNameMatch.length > 0) {
    return {
      exists: true,
      matchedSubstance: altNameMatch[0] as Partial<Substance>,
      matchType: "alternative_name",
    };
  }

  return { exists: false };
}

// ===========================================
// USER SUBSTANCE SUBMISSION
// ===========================================

export type CreateUserSubstanceInput = {
  common_name: string;
  cas_id?: string;
  fema_number?: number;
  pubchem_id?: number;
  iupac_name?: string;
  odor?: string;
  taste?: string;
  flavor_profile?: string;
  description?: string;
  is_natural?: boolean;
  synthetic?: boolean;
  molecular_formula?: string;
  molecular_weight?: number;
  smile?: string;
  inchi?: string;
  alternative_names?: string[];
  source_reference?: string;
};

/**
 * Create a new substance as a user contribution
 * Status will be 'user_entry' and usable immediately in user's flavours
 */
export async function createUserSubstance(
  data: CreateUserSubstanceInput
): Promise<Substance> {
  const userId = await getUserId();

  // Validate required fields
  if (!data.common_name || data.common_name.trim().length === 0) {
    throw new Error("Common name is required");
  }

  // Check for at least one identifier
  const hasIdentifier = data.cas_id || data.fema_number || data.pubchem_id;
  if (!hasIdentifier) {
    throw new Error(
      "At least one identifier is required: CAS ID, FEMA number, or PubChem ID"
    );
  }

  // Check for at least one sensory property
  const hasSensoryProperty = data.odor || data.taste || data.flavor_profile;
  if (!hasSensoryProperty) {
    throw new Error(
      "At least one sensory property is required: odor, taste, or flavor profile"
    );
  }

  // Check for duplicates before inserting
  const duplicateCheck = await checkDuplicateSubstance(data.common_name);
  if (duplicateCheck.exists) {
    throw new Error(
      `A substance with this name already exists: ${duplicateCheck.matchedSubstance?.common_name}`
    );
  }

  const result = await sql`
    INSERT INTO substance (
      common_name,
      cas_id,
      fema_number,
      pubchem_id,
      iupac_name,
      odor,
      taste,
      flavor_profile,
      description,
      is_natural,
      synthetic,
      molecular_formula,
      molecular_weight,
      smile,
      inchi,
      alternative_names,
      source_reference,
      verification_status,
      submitted_by_user_id,
      submitted_at
    )
    VALUES (
      ${data.common_name.trim()},
      ${data.cas_id ?? null},
      ${data.fema_number ?? null},
      ${data.pubchem_id ?? null},
      ${data.iupac_name ?? null},
      ${data.odor ?? null},
      ${data.taste ?? null},
      ${data.flavor_profile ?? null},
      ${data.description ?? null},
      ${data.is_natural ?? null},
      ${data.synthetic ?? null},
      ${data.molecular_formula ?? null},
      ${data.molecular_weight ?? null},
      ${data.smile ?? null},
      ${data.inchi ?? null},
      ${data.alternative_names ? JSON.stringify(data.alternative_names) : null}::jsonb,
      ${data.source_reference ?? null},
      'user_entry',
      ${userId},
      CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  const newSubstance = result[0] as Substance;

  // Send admin notification (fire and forget)
  try {
    await sendNewSubmissionNotification({
      substanceId: newSubstance.substance_id,
      substanceName: newSubstance.common_name,
      submittedByUserId: userId,
    });
  } catch (e) {
    console.error("Failed to send submission notification:", e);
  }

  // Track substance submission in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "substance_submitted",
    properties: {
      substance_id: newSubstance.substance_id,
      substance_name: newSubstance.common_name,
      has_cas_id: !!data.cas_id,
      has_fema_number: !!data.fema_number,
      has_pubchem_id: !!data.pubchem_id,
    },
  });

  return newSubstance;
}

/**
 * Update a user's own unverified substance
 */
export async function updateUserSubstance(
  substanceId: number,
  data: Partial<CreateUserSubstanceInput>
): Promise<Substance> {
  const userId = await getUserId();

  // Check substance exists, is owned by user, and is still editable
  const existing = await sql`
    SELECT * FROM substance
    WHERE substance_id = ${substanceId}
      AND submitted_by_user_id = ${userId}
      AND verification_status = 'user_entry'
  `;

  if (existing.length === 0) {
    throw new Error(
      "Substance not found, or you cannot edit it (may be under review or verified)"
    );
  }

  // If name is being changed, check for duplicates
  if (data.common_name && data.common_name !== existing[0].common_name) {
    const duplicateCheck = await checkDuplicateSubstance(data.common_name);
    if (duplicateCheck.exists) {
      throw new Error(
        `A substance with this name already exists: ${duplicateCheck.matchedSubstance?.common_name}`
      );
    }
  }

  const current = existing[0];

  const result = await sql`
    UPDATE substance SET
      common_name = ${data.common_name?.trim() ?? current.common_name},
      cas_id = ${data.cas_id !== undefined ? data.cas_id : current.cas_id},
      fema_number = ${data.fema_number !== undefined ? data.fema_number : current.fema_number},
      pubchem_id = ${data.pubchem_id !== undefined ? data.pubchem_id : current.pubchem_id},
      iupac_name = ${data.iupac_name !== undefined ? data.iupac_name : current.iupac_name},
      odor = ${data.odor !== undefined ? data.odor : current.odor},
      taste = ${data.taste !== undefined ? data.taste : current.taste},
      flavor_profile = ${data.flavor_profile !== undefined ? data.flavor_profile : current.flavor_profile},
      description = ${data.description !== undefined ? data.description : current.description},
      is_natural = ${data.is_natural !== undefined ? data.is_natural : current.is_natural},
      synthetic = ${data.synthetic !== undefined ? data.synthetic : current.synthetic},
      molecular_formula = ${data.molecular_formula !== undefined ? data.molecular_formula : current.molecular_formula},
      molecular_weight = ${data.molecular_weight !== undefined ? data.molecular_weight : current.molecular_weight},
      smile = ${data.smile !== undefined ? data.smile : current.smile},
      inchi = ${data.inchi !== undefined ? data.inchi : current.inchi},
      alternative_names = ${data.alternative_names !== undefined ? JSON.stringify(data.alternative_names) : current.alternative_names}::jsonb,
      source_reference = ${data.source_reference !== undefined ? data.source_reference : current.source_reference},
      updated_at = CURRENT_TIMESTAMP
    WHERE substance_id = ${substanceId}
    RETURNING *
  `;

  return result[0] as Substance;
}

/**
 * Get all substances submitted by the current user
 */
export async function getUserSubmissions(): Promise<Substance[]> {
  const userId = await getUserId();

  const result = await sql`
    SELECT * FROM substance
    WHERE submitted_by_user_id = ${userId}
    ORDER BY submitted_at DESC
  `;

  return result as Substance[];
}

/**
 * Get a specific substance if user can view it (owns it or it's verified)
 */
export async function getSubstanceForUser(
  substanceId: number
): Promise<Substance | null> {
  const userId = await getUserId();

  const result = await sql`
    SELECT * FROM substance
    WHERE substance_id = ${substanceId}
      AND (verification_status = 'verified' OR submitted_by_user_id = ${userId})
  `;

  if (result.length === 0) return null;
  return result[0] as Substance;
}

// ===========================================
// SUBSTANCE FEEDBACK
// ===========================================

export type CreateFeedbackInput = {
  substance_id: number;
  feedback_type: FeedbackTypeValue;
  target_field?: string;
  current_value?: string;
  suggested_value?: string;
  commentary: string;
  source_reference?: string;
};

/**
 * Submit feedback on an existing substance
 */
export async function createSubstanceFeedback(
  data: CreateFeedbackInput
): Promise<SubstanceFeedback> {
  const userId = await getUserId();

  // Validate commentary length
  if (!data.commentary || data.commentary.trim().length < 10) {
    throw new Error("Commentary must be at least 10 characters");
  }

  // If it's a change_request with a target_field, require suggested_value
  if (
    data.feedback_type === "change_request" &&
    data.target_field &&
    !data.suggested_value
  ) {
    throw new Error("Suggested value is required for change requests");
  }

  // Check substance exists and is viewable (verified or user's own)
  const substance = await sql`
    SELECT substance_id, common_name FROM substance
    WHERE substance_id = ${data.substance_id}
      AND (verification_status = 'verified' OR submitted_by_user_id = ${userId})
  `;

  if (substance.length === 0) {
    throw new Error("Substance not found");
  }

  const result = await sql`
    INSERT INTO substance_feedback (
      substance_id,
      submitted_by_user_id,
      feedback_type,
      target_field,
      current_value,
      suggested_value,
      commentary,
      source_reference,
      status
    )
    VALUES (
      ${data.substance_id},
      ${userId},
      ${data.feedback_type},
      ${data.target_field ?? null},
      ${data.current_value ?? null},
      ${data.suggested_value ?? null},
      ${data.commentary.trim()},
      ${data.source_reference ?? null},
      'pending'
    )
    RETURNING *
  `;

  const feedback = result[0] as SubstanceFeedback;

  // Send admin notification (fire and forget)
  try {
    await sendNewFeedbackNotification({
      feedbackId: feedback.feedback_id,
      substanceId: data.substance_id,
      substanceName: (substance[0] as { common_name: string }).common_name,
      feedbackType: data.feedback_type,
      submittedByUserId: userId,
    });
  } catch (e) {
    console.error("Failed to send feedback notification:", e);
  }

  // Track feedback submission in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "feedback_submitted",
    properties: {
      feedback_id: feedback.feedback_id,
      substance_id: data.substance_id,
      feedback_type: data.feedback_type,
      has_target_field: !!data.target_field,
      has_suggested_value: !!data.suggested_value,
    },
  });

  return feedback;
}

/**
 * Get all feedback submitted by the current user
 */
export async function getUserFeedback(): Promise<
  (SubstanceFeedback & { substance_name: string })[]
> {
  const userId = await getUserId();

  const result = await sql`
    SELECT sf.*, s.common_name as substance_name
    FROM substance_feedback sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.submitted_by_user_id = ${userId}
    ORDER BY sf.submitted_at DESC
  `;

  return result as (SubstanceFeedback & { substance_name: string })[];
}

/**
 * Get a specific feedback if user owns it
 */
export async function getUserFeedbackById(
  feedbackId: number
): Promise<(SubstanceFeedback & { substance_name: string }) | null> {
  const userId = await getUserId();

  const result = await sql`
    SELECT sf.*, s.common_name as substance_name
    FROM substance_feedback sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.feedback_id = ${feedbackId}
      AND sf.submitted_by_user_id = ${userId}
  `;

  if (result.length === 0) return null;
  return result[0] as SubstanceFeedback & { substance_name: string };
}
