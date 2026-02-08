"use server";

import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { getPostHogClient } from "@/lib/posthog-server";

// Types for variation system
export type VariationGroup = {
  group_id: number;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type FormulaVariation = {
  formula_id: number;
  name: string;
  description: string | null;
  variation_group_id: number | null;
  variation_label: string | null;
  is_main_variation: boolean;
  base_unit: string;
  created_at: string;
  updated_at: string;
};

export type FlavorProfileAttribute = {
  attribute: string;
  value: number;
};

export type VariationWithSubstances = FormulaVariation & {
  flavor_profile: FlavorProfileAttribute[] | null;
  substances: Array<{
    substance_id: number;
    common_name: string;
    fema_number: number;
    concentration: number | null;
    unit: string | null;
    order_index: number | null;
  }>;
};

export type ComparisonData = {
  group: VariationGroup;
  variations: VariationWithSubstances[];
  allSubstances: Array<{
    substance_id: number;
    common_name: string;
    fema_number: number;
  }>;
};

/**
 * Create a new variation group
 */
export async function createVariationGroup(data: {
  name: string;
  description?: string;
}): Promise<VariationGroup> {
  const userId = await getUserId();

  const { name, description } = data;

  const result = await sql`
    INSERT INTO variation_group (name, description, user_id)
    VALUES (${name}, ${description ?? null}, ${userId})
    RETURNING *
  `;

  return {
    group_id: Number(result[0].group_id),
    name: String(result[0].name),
    description: result[0].description ? String(result[0].description) : null,
    user_id: result[0].user_id ? String(result[0].user_id) : null,
    created_at: String(result[0].created_at),
    updated_at: String(result[0].updated_at),
  };
}

/**
 * Create a variation by cloning an existing formula
 * If the source formula doesn't have a group, creates one automatically
 */
export async function createVariation(
  sourceFormulaId: number,
  label: string
): Promise<{ formula: FormulaVariation; group: VariationGroup }> {
  const userId = await getUserId();

  // Get the source formula and check access
  const sourceResult = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${sourceFormulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (sourceResult.length === 0) {
    throw new Error("Source formula not found or access denied");
  }

  const source = sourceResult[0];
  let groupId = source.variation_group_id;
  let group: VariationGroup;

  // If source doesn't have a group, create one and assign it
  if (!groupId) {
    group = await createVariationGroup({
      name: `${source.name} Variations`,
      description: `Variation group for ${source.name}`,
    });
    groupId = group.group_id;

    // Update source formula to be part of the group and mark as main
    await sql`
      UPDATE formula
      SET variation_group_id = ${groupId},
          variation_label = 'Original',
          is_main_variation = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE formula_id = ${sourceFormulaId}
    `;
  } else {
    // Get existing group
    const groupResult = await sql`
      SELECT * FROM variation_group WHERE group_id = ${groupId}
    `;
    group = {
      group_id: Number(groupResult[0].group_id),
      name: String(groupResult[0].name),
      description: groupResult[0].description
        ? String(groupResult[0].description)
        : null,
      user_id: groupResult[0].user_id ? String(groupResult[0].user_id) : null,
      created_at: String(groupResult[0].created_at),
      updated_at: String(groupResult[0].updated_at),
    };
  }

  // Create new formula as variation
  const newFormulaResult = await sql`
    INSERT INTO formula (
      name, description, is_public, category_id, status, base_unit,
      user_id, flavor_profile, variation_group_id, variation_label, is_main_variation
    )
    VALUES (
      ${`${source.name} - ${label}`},
      ${source.description},
      false,
      ${source.category_id},
      'draft',
      ${source.base_unit},
      ${userId},
      ${source.flavor_profile},
      ${groupId},
      ${label},
      false
    )
    RETURNING *
  `;

  const newFormula = newFormulaResult[0];

  // Copy substances from source
  const substances = await sql`
    SELECT * FROM substance_formula WHERE formula_id = ${sourceFormulaId}
  `;

  for (const sub of substances) {
    await sql`
      INSERT INTO substance_formula (
        substance_id, formula_id, concentration, unit, order_index, supplier, dilution, price_per_kg
      )
      VALUES (
        ${sub.substance_id}, ${newFormula.formula_id}, ${sub.concentration},
        ${sub.unit}, ${sub.order_index}, ${sub.supplier}, ${sub.dilution}, ${sub.price_per_kg}
      )
    `;
  }

  // Track variation creation in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "variation_created",
    properties: {
      source_formula_id: sourceFormulaId,
      new_formula_id: newFormula.formula_id,
      variation_label: label,
      group_id: groupId,
      substance_count: substances.length,
    },
  });

  return {
    formula: {
      formula_id: Number(newFormula.formula_id),
      name: String(newFormula.name),
      description: newFormula.description
        ? String(newFormula.description)
        : null,
      variation_group_id: Number(newFormula.variation_group_id),
      variation_label: newFormula.variation_label
        ? String(newFormula.variation_label)
        : null,
      is_main_variation: Boolean(newFormula.is_main_variation),
      base_unit: String(newFormula.base_unit),
      created_at: String(newFormula.created_at),
      updated_at: String(newFormula.updated_at),
    },
    group,
  };
}

/**
 * Get all variations for a group with their substances
 */
export async function getVariationsForGroup(
  groupId: number
): Promise<ComparisonData> {
  const userId = await getUserId();

  // Get group and check access
  const groupResult = await sql`
    SELECT * FROM variation_group
    WHERE group_id = ${groupId} AND user_id = ${userId}
  `;

  if (groupResult.length === 0) {
    throw new Error("Variation group not found or access denied");
  }

  const group: VariationGroup = {
    group_id: Number(groupResult[0].group_id),
    name: String(groupResult[0].name),
    description: groupResult[0].description
      ? String(groupResult[0].description)
      : null,
    user_id: groupResult[0].user_id ? String(groupResult[0].user_id) : null,
    created_at: String(groupResult[0].created_at),
    updated_at: String(groupResult[0].updated_at),
  };

  // Get all formulas in this group
  const formulasResult = await sql`
    SELECT * FROM formula
    WHERE variation_group_id = ${groupId}
    ORDER BY is_main_variation DESC, created_at ASC
  `;

  // Get all substances across all variations
  const allSubstancesResult = await sql`
    SELECT DISTINCT s.substance_id, s.common_name, s.fema_number
    FROM substance s
    JOIN substance_formula sf ON s.substance_id = sf.substance_id
    JOIN formula f ON sf.formula_id = f.formula_id
    WHERE f.variation_group_id = ${groupId}
    ORDER BY s.common_name
  `;

  const allSubstances = allSubstancesResult.map((s) => ({
    substance_id: Number(s.substance_id),
    common_name: String(s.common_name),
    fema_number: Number(s.fema_number),
  }));

  // Build variations with substances
  const variations: VariationWithSubstances[] = [];

  for (const f of formulasResult) {
    const substancesResult = await sql`
      SELECT s.substance_id, s.common_name, s.fema_number,
             sf.concentration, sf.unit, sf.order_index
      FROM substance_formula sf
      JOIN substance s ON sf.substance_id = s.substance_id
      WHERE sf.formula_id = ${f.formula_id}
      ORDER BY sf.order_index
    `;

    // Parse flavor_profile from JSONB
    let flavorProfile: FlavorProfileAttribute[] | null = null;
    if (f.flavor_profile) {
      try {
        flavorProfile = typeof f.flavor_profile === 'string'
          ? JSON.parse(f.flavor_profile)
          : f.flavor_profile;
      } catch {
        flavorProfile = null;
      }
    }

    variations.push({
      formula_id: Number(f.formula_id),
      name: String(f.name),
      description: f.description ? String(f.description) : null,
      variation_group_id: Number(f.variation_group_id),
      variation_label: f.variation_label ? String(f.variation_label) : null,
      is_main_variation: Boolean(f.is_main_variation),
      base_unit: String(f.base_unit),
      created_at: String(f.created_at),
      updated_at: String(f.updated_at),
      flavor_profile: flavorProfile,
      substances: substancesResult.map((s) => ({
        substance_id: Number(s.substance_id),
        common_name: String(s.common_name),
        fema_number: Number(s.fema_number),
        concentration: s.concentration ? Number(s.concentration) : null,
        unit: s.unit ? String(s.unit) : null,
        order_index: s.order_index ? Number(s.order_index) : null,
      })),
    });
  }

  return { group, variations, allSubstances };
}

/**
 * Get variations for a formula (if it belongs to a group)
 */
export async function getVariationsForFormula(
  formulaId: number
): Promise<ComparisonData | null> {
  const userId = await getUserId();

  // Get formula and its group
  const formulaResult = await sql`
    SELECT variation_group_id FROM formula
    WHERE formula_id = ${formulaId}
      AND (user_id = ${userId} OR EXISTS (
        SELECT 1 FROM formula_shares fs
        WHERE fs.formula_id = ${formulaId} AND fs.shared_with_user_id = ${userId}
      ) OR EXISTS (
        SELECT 1 FROM workspace_formula wf
        JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
        WHERE wf.formula_id = ${formulaId} AND wm.user_id = ${userId}
      ))
  `;

  if (formulaResult.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const groupId = formulaResult[0].variation_group_id;
  if (!groupId) {
    return null; // No variations
  }

  return getVariationsForGroup(groupId);
}

/**
 * Set a variation as the main variation
 */
export async function setMainVariation(
  formulaId: number
): Promise<FormulaVariation> {
  const userId = await getUserId();

  // Get the formula and its group
  const formulaResult = await sql`
    SELECT f.*, vg.user_id as group_user_id
    FROM formula f
    JOIN variation_group vg ON f.variation_group_id = vg.group_id
    WHERE f.formula_id = ${formulaId}
  `;

  if (formulaResult.length === 0) {
    throw new Error("Formula not found or not part of a variation group");
  }

  const formula = formulaResult[0];

  // Check user owns the group
  if (formula.group_user_id !== userId) {
    throw new Error("Access denied");
  }

  // Unset current main variation
  await sql`
    UPDATE formula
    SET is_main_variation = false, updated_at = CURRENT_TIMESTAMP
    WHERE variation_group_id = ${formula.variation_group_id}
  `;

  // Set new main variation
  const result = await sql`
    UPDATE formula
    SET is_main_variation = true, updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return {
    formula_id: Number(result[0].formula_id),
    name: String(result[0].name),
    description: result[0].description ? String(result[0].description) : null,
    variation_group_id: Number(result[0].variation_group_id),
    variation_label: result[0].variation_label
      ? String(result[0].variation_label)
      : null,
    is_main_variation: Boolean(result[0].is_main_variation),
    base_unit: String(result[0].base_unit),
    created_at: String(result[0].created_at),
    updated_at: String(result[0].updated_at),
  };
}

/**
 * Update concentration for a substance in a variation
 */
export async function updateVariationConcentration(
  formulaId: number,
  substanceId: number,
  concentration: number
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  await sql`
    UPDATE substance_formula
    SET concentration = ${concentration}
    WHERE formula_id = ${formulaId} AND substance_id = ${substanceId}
  `;

  // Update formula timestamp
  await sql`
    UPDATE formula SET updated_at = CURRENT_TIMESTAMP WHERE formula_id = ${formulaId}
  `;
}

/**
 * Bulk update concentrations for multiple substances across variations
 */
export async function bulkUpdateVariations(
  updates: Array<{
    formulaId: number;
    substanceId: number;
    concentration: number;
  }>
): Promise<void> {
  const userId = await getUserId();

  if (updates.length === 0) return;

  // Get unique formula IDs
  const formulaIds = [...new Set(updates.map((u) => u.formulaId))];

  // Check access to all formulas
  for (const formulaId of formulaIds) {
    const accessCheck = await sql`
      SELECT f.*
      FROM formula f
      LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
      LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
        AND wm.user_id = ${userId}
      WHERE f.formula_id = ${formulaId}
        AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
    `;

    if (accessCheck.length === 0) {
      throw new Error(`Access denied to formula ${formulaId}`);
    }
  }

  // Apply updates
  for (const update of updates) {
    await sql`
      UPDATE substance_formula
      SET concentration = ${update.concentration}
      WHERE formula_id = ${update.formulaId} AND substance_id = ${update.substanceId}
    `;
  }

  // Update timestamps for all modified formulas
  for (const formulaId of formulaIds) {
    await sql`
      UPDATE formula SET updated_at = CURRENT_TIMESTAMP WHERE formula_id = ${formulaId}
    `;
  }
}

/**
 * Add a substance to a variation
 */
export async function addSubstanceToVariation(
  formulaId: number,
  substanceId: number,
  concentration: number,
  unit: string
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  // Get max order index
  const maxOrderResult = await sql`
    SELECT COALESCE(MAX(order_index), 0) as max_order
    FROM substance_formula WHERE formula_id = ${formulaId}
  `;
  const nextOrder = Number(maxOrderResult[0].max_order) + 1;

  await sql`
    INSERT INTO substance_formula (substance_id, formula_id, concentration, unit, order_index)
    VALUES (${substanceId}, ${formulaId}, ${concentration}, ${unit}, ${nextOrder})
    ON CONFLICT (substance_id, formula_id) DO UPDATE
    SET concentration = ${concentration}, unit = ${unit}
  `;

  await sql`
    UPDATE formula SET updated_at = CURRENT_TIMESTAMP WHERE formula_id = ${formulaId}
  `;
}

/**
 * Remove a substance from a variation
 */
export async function removeSubstanceFromVariation(
  formulaId: number,
  substanceId: number
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  await sql`
    DELETE FROM substance_formula
    WHERE formula_id = ${formulaId} AND substance_id = ${substanceId}
  `;

  await sql`
    UPDATE formula SET updated_at = CURRENT_TIMESTAMP WHERE formula_id = ${formulaId}
  `;
}

/**
 * Delete a variation (but not the main variation)
 */
export async function deleteVariation(formulaId: number): Promise<void> {
  const userId = await getUserId();

  // Check formula exists, is owned by user, and is not the main variation
  const formulaResult = await sql`
    SELECT * FROM formula
    WHERE formula_id = ${formulaId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (formulaResult.length === 0) {
    throw new Error("Variation not found or access denied");
  }

  const formula = formulaResult[0];

  if (formula.is_main_variation) {
    throw new Error("Cannot delete the main variation");
  }

  // Delete substance links
  await sql`DELETE FROM substance_formula WHERE formula_id = ${formulaId}`;

  // Delete formula
  await sql`DELETE FROM formula WHERE formula_id = ${formulaId}`;

  // Track variation deletion in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "variation_deleted",
    properties: {
      formula_id: formulaId,
      variation_label: formula.variation_label,
      group_id: formula.variation_group_id,
    },
  });
}

/**
 * Update variation label
 */
export async function updateVariationLabel(
  formulaId: number,
  label: string
): Promise<void> {
  const userId = await getUserId();

  const accessCheck = await sql`
    SELECT * FROM formula
    WHERE formula_id = ${formulaId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (accessCheck.length === 0) {
    throw new Error("Variation not found or access denied");
  }

  await sql`
    UPDATE formula
    SET variation_label = ${label}, updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
  `;
}

/**
 * Update variation details (label and description)
 */
export async function updateVariationDetails(
  formulaId: number,
  data: {
    label?: string;
    description?: string | null;
  }
): Promise<FormulaVariation> {
  const userId = await getUserId();

  const accessCheck = await sql`
    SELECT * FROM formula
    WHERE formula_id = ${formulaId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (accessCheck.length === 0) {
    throw new Error("Variation not found or access denied");
  }

  // Get current values
  const current = accessCheck[0];
  const newLabel = data.label !== undefined ? data.label : current.variation_label;
  const newDescription = data.description !== undefined ? data.description : current.description;

  const result = await sql`
    UPDATE formula
    SET variation_label = ${newLabel},
        description = ${newDescription},
        updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return {
    formula_id: Number(result[0].formula_id),
    name: String(result[0].name),
    description: result[0].description ? String(result[0].description) : null,
    variation_group_id: Number(result[0].variation_group_id),
    variation_label: result[0].variation_label
      ? String(result[0].variation_label)
      : null,
    is_main_variation: Boolean(result[0].is_main_variation),
    base_unit: String(result[0].base_unit),
    created_at: String(result[0].created_at),
    updated_at: String(result[0].updated_at),
  };
}

/**
 * Sync description from one variation to all others in the group
 */
export async function syncVariationDescriptions(
  sourceFormulaId: number
): Promise<void> {
  const userId = await getUserId();

  // Get source formula and its group
  const sourceResult = await sql`
    SELECT description, variation_group_id FROM formula
    WHERE formula_id = ${sourceFormulaId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (sourceResult.length === 0) {
    throw new Error("Source variation not found or access denied");
  }

  const { description, variation_group_id } = sourceResult[0];

  // Update all other variations in the group
  await sql`
    UPDATE formula
    SET description = ${description}, updated_at = CURRENT_TIMESTAMP
    WHERE variation_group_id = ${variation_group_id}
      AND formula_id != ${sourceFormulaId}
  `;
}
