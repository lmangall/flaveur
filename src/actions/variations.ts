"use server";

import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";

// Types for variation system
export type VariationGroup = {
  group_id: number;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type FlavourVariation = {
  flavour_id: number;
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

export type VariationWithSubstances = FlavourVariation & {
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
 * Create a variation by cloning an existing flavour
 * If the source flavour doesn't have a group, creates one automatically
 */
export async function createVariation(
  sourceFlavourId: number,
  label: string
): Promise<{ flavour: FlavourVariation; group: VariationGroup }> {
  const userId = await getUserId();

  // Get the source flavour and check access
  const sourceResult = await sql`
    SELECT f.*
    FROM flavour f
    LEFT JOIN flavour_shares fs ON f.flavour_id = fs.flavour_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${sourceFlavourId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (sourceResult.length === 0) {
    throw new Error("Source flavour not found or access denied");
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

    // Update source flavour to be part of the group and mark as main
    await sql`
      UPDATE flavour
      SET variation_group_id = ${groupId},
          variation_label = 'Original',
          is_main_variation = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE flavour_id = ${sourceFlavourId}
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

  // Create new flavour as variation
  const newFlavourResult = await sql`
    INSERT INTO flavour (
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

  const newFlavour = newFlavourResult[0];

  // Copy substances from source
  const substances = await sql`
    SELECT * FROM substance_flavour WHERE flavour_id = ${sourceFlavourId}
  `;

  for (const sub of substances) {
    await sql`
      INSERT INTO substance_flavour (
        substance_id, flavour_id, concentration, unit, order_index, supplier, dilution, price_per_kg
      )
      VALUES (
        ${sub.substance_id}, ${newFlavour.flavour_id}, ${sub.concentration},
        ${sub.unit}, ${sub.order_index}, ${sub.supplier}, ${sub.dilution}, ${sub.price_per_kg}
      )
    `;
  }

  return {
    flavour: {
      flavour_id: Number(newFlavour.flavour_id),
      name: String(newFlavour.name),
      description: newFlavour.description
        ? String(newFlavour.description)
        : null,
      variation_group_id: Number(newFlavour.variation_group_id),
      variation_label: newFlavour.variation_label
        ? String(newFlavour.variation_label)
        : null,
      is_main_variation: Boolean(newFlavour.is_main_variation),
      base_unit: String(newFlavour.base_unit),
      created_at: String(newFlavour.created_at),
      updated_at: String(newFlavour.updated_at),
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

  // Get all flavours in this group
  const flavoursResult = await sql`
    SELECT * FROM flavour
    WHERE variation_group_id = ${groupId}
    ORDER BY is_main_variation DESC, created_at ASC
  `;

  // Get all substances across all variations
  const allSubstancesResult = await sql`
    SELECT DISTINCT s.substance_id, s.common_name, s.fema_number
    FROM substance s
    JOIN substance_flavour sf ON s.substance_id = sf.substance_id
    JOIN flavour f ON sf.flavour_id = f.flavour_id
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

  for (const f of flavoursResult) {
    const substancesResult = await sql`
      SELECT s.substance_id, s.common_name, s.fema_number,
             sf.concentration, sf.unit, sf.order_index
      FROM substance_flavour sf
      JOIN substance s ON sf.substance_id = s.substance_id
      WHERE sf.flavour_id = ${f.flavour_id}
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
      flavour_id: Number(f.flavour_id),
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
 * Get variations for a flavour (if it belongs to a group)
 */
export async function getVariationsForFlavour(
  flavourId: number
): Promise<ComparisonData | null> {
  const userId = await getUserId();

  // Get flavour and its group
  const flavourResult = await sql`
    SELECT variation_group_id FROM flavour
    WHERE flavour_id = ${flavourId}
      AND (user_id = ${userId} OR EXISTS (
        SELECT 1 FROM flavour_shares fs
        WHERE fs.flavour_id = ${flavourId} AND fs.shared_with_user_id = ${userId}
      ) OR EXISTS (
        SELECT 1 FROM workspace_flavour wf
        JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
        WHERE wf.flavour_id = ${flavourId} AND wm.user_id = ${userId}
      ))
  `;

  if (flavourResult.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const groupId = flavourResult[0].variation_group_id;
  if (!groupId) {
    return null; // No variations
  }

  return getVariationsForGroup(groupId);
}

/**
 * Set a variation as the main variation
 */
export async function setMainVariation(
  flavourId: number
): Promise<FlavourVariation> {
  const userId = await getUserId();

  // Get the flavour and its group
  const flavourResult = await sql`
    SELECT f.*, vg.user_id as group_user_id
    FROM flavour f
    JOIN variation_group vg ON f.variation_group_id = vg.group_id
    WHERE f.flavour_id = ${flavourId}
  `;

  if (flavourResult.length === 0) {
    throw new Error("Flavour not found or not part of a variation group");
  }

  const flavour = flavourResult[0];

  // Check user owns the group
  if (flavour.group_user_id !== userId) {
    throw new Error("Access denied");
  }

  // Unset current main variation
  await sql`
    UPDATE flavour
    SET is_main_variation = false, updated_at = CURRENT_TIMESTAMP
    WHERE variation_group_id = ${flavour.variation_group_id}
  `;

  // Set new main variation
  const result = await sql`
    UPDATE flavour
    SET is_main_variation = true, updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
    RETURNING *
  `;

  return {
    flavour_id: Number(result[0].flavour_id),
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
  flavourId: number,
  substanceId: number,
  concentration: number
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  await sql`
    UPDATE substance_flavour
    SET concentration = ${concentration}
    WHERE flavour_id = ${flavourId} AND substance_id = ${substanceId}
  `;

  // Update flavour timestamp
  await sql`
    UPDATE flavour SET updated_at = CURRENT_TIMESTAMP WHERE flavour_id = ${flavourId}
  `;
}

/**
 * Bulk update concentrations for multiple substances across variations
 */
export async function bulkUpdateVariations(
  updates: Array<{
    flavourId: number;
    substanceId: number;
    concentration: number;
  }>
): Promise<void> {
  const userId = await getUserId();

  if (updates.length === 0) return;

  // Get unique flavour IDs
  const flavourIds = [...new Set(updates.map((u) => u.flavourId))];

  // Check access to all flavours
  for (const flavourId of flavourIds) {
    const accessCheck = await sql`
      SELECT f.*
      FROM flavour f
      LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
      LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
        AND wm.user_id = ${userId}
      WHERE f.flavour_id = ${flavourId}
        AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
    `;

    if (accessCheck.length === 0) {
      throw new Error(`Access denied to flavour ${flavourId}`);
    }
  }

  // Apply updates
  for (const update of updates) {
    await sql`
      UPDATE substance_flavour
      SET concentration = ${update.concentration}
      WHERE flavour_id = ${update.flavourId} AND substance_id = ${update.substanceId}
    `;
  }

  // Update timestamps for all modified flavours
  for (const flavourId of flavourIds) {
    await sql`
      UPDATE flavour SET updated_at = CURRENT_TIMESTAMP WHERE flavour_id = ${flavourId}
    `;
  }
}

/**
 * Add a substance to a variation
 */
export async function addSubstanceToVariation(
  flavourId: number,
  substanceId: number,
  concentration: number,
  unit: string
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  // Get max order index
  const maxOrderResult = await sql`
    SELECT COALESCE(MAX(order_index), 0) as max_order
    FROM substance_flavour WHERE flavour_id = ${flavourId}
  `;
  const nextOrder = Number(maxOrderResult[0].max_order) + 1;

  await sql`
    INSERT INTO substance_flavour (substance_id, flavour_id, concentration, unit, order_index)
    VALUES (${substanceId}, ${flavourId}, ${concentration}, ${unit}, ${nextOrder})
    ON CONFLICT (substance_id, flavour_id) DO UPDATE
    SET concentration = ${concentration}, unit = ${unit}
  `;

  await sql`
    UPDATE flavour SET updated_at = CURRENT_TIMESTAMP WHERE flavour_id = ${flavourId}
  `;
}

/**
 * Remove a substance from a variation
 */
export async function removeSubstanceFromVariation(
  flavourId: number,
  substanceId: number
): Promise<void> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  await sql`
    DELETE FROM substance_flavour
    WHERE flavour_id = ${flavourId} AND substance_id = ${substanceId}
  `;

  await sql`
    UPDATE flavour SET updated_at = CURRENT_TIMESTAMP WHERE flavour_id = ${flavourId}
  `;
}

/**
 * Delete a variation (but not the main variation)
 */
export async function deleteVariation(flavourId: number): Promise<void> {
  const userId = await getUserId();

  // Check flavour exists, is owned by user, and is not the main variation
  const flavourResult = await sql`
    SELECT * FROM flavour
    WHERE flavour_id = ${flavourId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (flavourResult.length === 0) {
    throw new Error("Variation not found or access denied");
  }

  const flavour = flavourResult[0];

  if (flavour.is_main_variation) {
    throw new Error("Cannot delete the main variation");
  }

  // Delete substance links
  await sql`DELETE FROM substance_flavour WHERE flavour_id = ${flavourId}`;

  // Delete flavour
  await sql`DELETE FROM flavour WHERE flavour_id = ${flavourId}`;
}

/**
 * Update variation label
 */
export async function updateVariationLabel(
  flavourId: number,
  label: string
): Promise<void> {
  const userId = await getUserId();

  const accessCheck = await sql`
    SELECT * FROM flavour
    WHERE flavour_id = ${flavourId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (accessCheck.length === 0) {
    throw new Error("Variation not found or access denied");
  }

  await sql`
    UPDATE flavour
    SET variation_label = ${label}, updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
  `;
}

/**
 * Update variation details (label and description)
 */
export async function updateVariationDetails(
  flavourId: number,
  data: {
    label?: string;
    description?: string | null;
  }
): Promise<FlavourVariation> {
  const userId = await getUserId();

  const accessCheck = await sql`
    SELECT * FROM flavour
    WHERE flavour_id = ${flavourId}
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
    UPDATE flavour
    SET variation_label = ${newLabel},
        description = ${newDescription},
        updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
    RETURNING *
  `;

  return {
    flavour_id: Number(result[0].flavour_id),
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
  sourceFlavourId: number
): Promise<void> {
  const userId = await getUserId();

  // Get source flavour and its group
  const sourceResult = await sql`
    SELECT description, variation_group_id FROM flavour
    WHERE flavour_id = ${sourceFlavourId}
      AND user_id = ${userId}
      AND variation_group_id IS NOT NULL
  `;

  if (sourceResult.length === 0) {
    throw new Error("Source variation not found or access denied");
  }

  const { description, variation_group_id } = sourceResult[0];

  // Update all other variations in the group
  await sql`
    UPDATE flavour
    SET description = ${description}, updated_at = CURRENT_TIMESTAMP
    WHERE variation_group_id = ${variation_group_id}
      AND flavour_id != ${sourceFlavourId}
  `;
}
