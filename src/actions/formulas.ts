"use server";

import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import {
  type FormulaStatusValue,
  isValidFormulaStatus,
  isValidCosmeticProductType,
} from "@/constants";
import { createFormulaSchema, updateFormulaSchema } from "@/lib/validations/formula";
import { getPostHogClient } from "@/lib/posthog-server";

export type FormulaAccessSource = "own" | "shared" | "workspace";

export type FormulaWithAccess = {
  formula_id: number;
  name: string;
  description: string | null;
  notes: string | null;
  is_public: boolean;
  user_id: string | null;
  category_id: number | null;
  category_name: string | null;
  status: string;
  version: number;
  base_unit: string;
  flavor_profile: Record<string, number> | null;
  project_type: string;
  created_at: string;
  updated_at: string;
  // Variation fields
  variation_group_id: number | null;
  variation_label: string | null;
  is_main_variation: boolean;
  // Cosmetics fields
  cosmetic_product_type: string | null;
  target_ph: number | null;
  preservative_system: string | null;
  manufacturing_notes: string | null;
  // Access info
  access_source: FormulaAccessSource;
  shared_by_username?: string | null;
  shared_by_email?: string | null;
  workspace_name?: string | null;
  workspace_id?: number | null;
  can_edit: boolean;
};

export async function getFormulas(): Promise<FormulaWithAccess[]> {
  const userId = await getUserId();

  // Get all formulas user has access to: owned, shared, or via workspace
  const result = await sql`
    SELECT DISTINCT ON (f.formula_id)
      f.*,
      c.name as category_name,
      CASE
        WHEN f.user_id = ${userId} THEN 'own'
        WHEN fs.share_id IS NOT NULL THEN 'shared'
        WHEN wm.member_id IS NOT NULL THEN 'workspace'
      END as access_source,
      sharer.username as shared_by_username,
      sharer.email as shared_by_email,
      w.name as workspace_name,
      w.workspace_id as access_workspace_id,
      CASE
        WHEN f.user_id = ${userId} THEN true
        WHEN wm.role IN ('owner', 'editor') THEN true
        ELSE false
      END as can_edit
    FROM formula f
    LEFT JOIN category c ON f.category_id = c.category_id
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN users sharer ON fs.shared_by_user_id = sharer.user_id
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    LEFT JOIN workspace w ON wf.workspace_id = w.workspace_id
    WHERE f.user_id = ${userId}
      OR fs.share_id IS NOT NULL
      OR wm.member_id IS NOT NULL
    ORDER BY f.formula_id,
      CASE
        WHEN f.user_id = ${userId} THEN 1
        WHEN wm.member_id IS NOT NULL THEN 2
        ELSE 3
      END
  `;

  return result.map((f) => ({
    formula_id: Number(f.formula_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    notes: f.notes ? String(f.notes) : null,
    is_public: Boolean(f.is_public),
    user_id: f.user_id ? String(f.user_id) : null,
    category_id: f.category_id ? Number(f.category_id) : null,
    category_name: f.category_name ? String(f.category_name) : null,
    status: String(f.status),
    version: Number(f.version),
    base_unit: String(f.base_unit),
    flavor_profile: f.flavor_profile as Record<string, number> | null,
    project_type: f.project_type ? String(f.project_type) : "flavor",
    created_at: String(f.created_at),
    updated_at: String(f.updated_at),
    // Cosmetics fields
    cosmetic_product_type: f.cosmetic_product_type ? String(f.cosmetic_product_type) : null,
    target_ph: f.target_ph != null ? Number(f.target_ph) : null,
    preservative_system: f.preservative_system ? String(f.preservative_system) : null,
    manufacturing_notes: f.manufacturing_notes ? String(f.manufacturing_notes) : null,
    // Variation fields
    variation_group_id: f.variation_group_id ? Number(f.variation_group_id) : null,
    variation_label: f.variation_label ? String(f.variation_label) : null,
    is_main_variation: Boolean(f.is_main_variation),
    // Access info
    access_source: String(f.access_source) as FormulaAccessSource,
    shared_by_username: f.shared_by_username ? String(f.shared_by_username) : null,
    shared_by_email: f.shared_by_email ? String(f.shared_by_email) : null,
    workspace_name: f.workspace_name ? String(f.workspace_name) : null,
    workspace_id: f.access_workspace_id ? Number(f.access_workspace_id) : null,
    can_edit: Boolean(f.can_edit),
  }));
}

export async function getFormulaById(formulaId: number) {
  const userId = await getUserId();

  // Check if user is owner OR has shared access OR has workspace access
  const accessCheck = await sql`
    SELECT
      f.*,
      CASE WHEN f.user_id = ${userId} THEN true ELSE false END as is_owner,
      CASE WHEN fs.share_id IS NOT NULL THEN true ELSE false END as is_shared_with_me,
      sharer.username as shared_by_username,
      sharer.email as shared_by_email,
      CASE WHEN wm.member_id IS NOT NULL THEN true ELSE false END as has_workspace_access,
      wm.role as workspace_role,
      w.name as workspace_name,
      w.workspace_id as access_workspace_id
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN users sharer ON fs.shared_by_user_id = sharer.user_id
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    LEFT JOIN workspace w ON wf.workspace_id = w.workspace_id
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Forbidden: You do not have access to this formula");
  }

  const formulaData = accessCheck[0];
  const isOwner = Boolean(formulaData.is_owner);
  const isSharedWithMe = Boolean(formulaData.is_shared_with_me);
  const hasWorkspaceAccess = Boolean(formulaData.has_workspace_access);
  const workspaceRole = formulaData.workspace_role as string | null;
  const canEditViaWorkspace = hasWorkspaceAccess && (workspaceRole === "owner" || workspaceRole === "editor");

  // Extract formula fields (without the computed fields)
  const {
    is_owner,
    is_shared_with_me,
    shared_by_username,
    shared_by_email,
    has_workspace_access,
    workspace_role,
    workspace_name,
    access_workspace_id,
    ...formula
  } = formulaData;

  // Get substances with junction table data (concentration, unit, supplier, dilution, price_per_kg, pyramid_position)
  const substances = await sql`
    SELECT
      s.*,
      sf.concentration,
      sf.unit,
      sf.order_index,
      sf.supplier,
      sf.dilution,
      sf.price_per_kg,
      sf.pyramid_position,
      sf.phase
    FROM substance_formula sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.formula_id = ${formulaId}
    ORDER BY sf.order_index
  `;

  // Get ingredient formulas (compounds) with their basic info
  const ingredientFormulas = await sql`
    SELECT
      inf.ingredient_formula_id,
      inf.concentration,
      inf.unit,
      inf.order_index,
      f.formula_id,
      f.name,
      f.description,
      f.base_unit,
      f.status,
      f.version,
      (
        SELECT COUNT(*) FROM substance_formula sf2 WHERE sf2.formula_id = f.formula_id
      ) as substance_count
    FROM ingredient_formula inf
    JOIN formula f ON inf.ingredient_formula_id = f.formula_id
    WHERE inf.parent_formula_id = ${formulaId}
    ORDER BY inf.order_index
  `;

  return {
    formula,
    substances,
    ingredientFormulas: ingredientFormulas.map((inf) => ({
      ingredient_formula_id: Number(inf.ingredient_formula_id),
      concentration: Number(inf.concentration),
      unit: String(inf.unit),
      order_index: Number(inf.order_index),
      ingredient: {
        formula_id: Number(inf.formula_id),
        name: String(inf.name),
        description: inf.description ? String(inf.description) : null,
        base_unit: String(inf.base_unit),
        status: String(inf.status),
        version: Number(inf.version),
        substance_count: Number(inf.substance_count),
      },
    })),
    isOwner,
    isSharedWithMe,
    sharedBy: isSharedWithMe ? {
      username: shared_by_username,
      email: shared_by_email,
    } : null,
    hasWorkspaceAccess,
    canEditViaWorkspace,
    workspace: hasWorkspaceAccess ? {
      workspace_id: access_workspace_id,
      name: workspace_name,
      role: workspaceRole,
    } : null,
  };
}

// Default zeroed flavor profile for new formulas
const DEFAULT_FLAVOR_PROFILE = [
  { attribute: "Sweetness", value: 0 },
  { attribute: "Sourness", value: 0 },
  { attribute: "Bitterness", value: 0 },
  { attribute: "Umami", value: 0 },
  { attribute: "Saltiness", value: 0 },
];

export async function createFormula(data: {
  name: string;
  description?: string;
  is_public?: boolean;
  category_id?: number | null;
  status?: string;
  base_unit?: string;
  project_type?: string;
  cosmetic_product_type?: string | null;
  target_ph?: number | null;
  preservative_system?: string | null;
  manufacturing_notes?: string | null;
  substances?: Array<{
    fema_number: number;
    concentration: number;
    unit: string;
    order_index: number;
    supplier?: string | null;
    dilution?: string | null;
    price_per_kg?: number | null;
  }>;
}) {
  const userId = await getUserId();

  // Validate with Zod
  const validation = createFormulaSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid formula data");
  }

  const {
    name,
    description,
    is_public,
    category_id,
    status,
    base_unit,
    project_type,
    cosmetic_product_type,
    target_ph,
    preservative_system,
    manufacturing_notes,
    substances,
  } = validation.data;

  // Validate cosmetic_product_type if project is cosmetic
  if (project_type === "cosmetic" && cosmetic_product_type && !isValidCosmeticProductType(cosmetic_product_type)) {
    throw new Error(`Invalid cosmetic product type: ${cosmetic_product_type}`);
  }

  // Cosmetics don't use the default flavor profile radar chart
  const flavorProfile = project_type === "cosmetic" ? [] : DEFAULT_FLAVOR_PROFILE;

  // Insert formula
  const formulaResult = await sql`
    INSERT INTO formula (name, description, is_public, category_id, status, base_unit, user_id, flavor_profile, project_type, cosmetic_product_type, target_ph, preservative_system, manufacturing_notes)
    VALUES (${name}, ${description ?? null}, ${is_public}, ${category_id}, ${status}, ${base_unit}, ${userId}, ${JSON.stringify(flavorProfile)}::jsonb, ${project_type}, ${cosmetic_product_type ?? null}, ${target_ph ?? null}, ${preservative_system ?? null}, ${manufacturing_notes ?? null})
    RETURNING *
  `;

  const newFormula = formulaResult[0];
  const insertedSubstances: Record<string, unknown>[] = [];

  // Insert substances if provided
  for (const sub of substances) {
    const { fema_number, concentration, unit, order_index, supplier, dilution, price_per_kg } = sub;

    // Find substance_id by fema_number
    const substanceCheck = await sql`
      SELECT substance_id FROM public.substance WHERE fema_number = ${fema_number}
    `;

    if (substanceCheck.length === 0) {
      throw new Error(`Substance with FEMA number ${fema_number} not found.`);
    }

    const substanceId = substanceCheck[0].substance_id;

    // Insert into substance_formula
    const result = await sql`
      INSERT INTO public.substance_formula (substance_id, formula_id, concentration, unit, order_index, supplier, dilution, price_per_kg)
      VALUES (${substanceId}, ${newFormula.formula_id}, ${concentration}, ${unit}, ${order_index}, ${supplier ?? null}, ${dilution ?? null}, ${price_per_kg ?? null})
      RETURNING *
    `;

    insertedSubstances.push(result[0]);
  }

  // Track formula creation in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "formula_created",
    properties: {
      formula_id: newFormula.formula_id,
      formula_name: name,
      is_public: is_public,
      status: status,
      substance_count: substances.length,
    },
  });

  return { formula: newFormula, substances: insertedSubstances };
}

export async function addSubstanceToFormula(
  formulaId: number,
  data: {
    fema_number: number;
    concentration?: number | null;
    unit?: string | null;
    order_index: number;
    supplier?: string | null;
    dilution?: string | null;
    price_per_kg?: number | null;
    pyramid_position?: string | null;
    phase?: string | null;
  }
) {
  const userId = await getUserId();

  const { fema_number, concentration, unit, order_index, supplier, dilution, price_per_kg, pyramid_position, phase } = data;

  // Check substance exists
  const substanceCheck = await sql`
    SELECT substance_id FROM public.substance WHERE fema_number = ${fema_number}
  `;

  if (substanceCheck.length === 0) {
    throw new Error("Substance not found");
  }

  const substanceId = substanceCheck[0].substance_id;

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    INSERT INTO public.substance_formula (substance_id, formula_id, concentration, unit, order_index, supplier, dilution, price_per_kg, pyramid_position, phase)
    VALUES (${substanceId}, ${formulaId}, ${concentration ?? null}, ${unit || null}, ${order_index}, ${supplier ?? null}, ${dilution ?? null}, ${price_per_kg ?? null}, ${pyramid_position ?? null}, ${phase ?? null})
    RETURNING *
  `;

  return result[0];
}

export async function removeSubstanceFromFormula(
  formulaId: number,
  substanceId: number
) {
  const userId = await getUserId();

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const checkRelation = await sql`
    SELECT * FROM public.substance_formula
    WHERE substance_id = ${substanceId} AND formula_id = ${formulaId}
  `;

  if (checkRelation.length === 0) {
    throw new Error(
      `Substance with ID ${substanceId} not found in formula with ID ${formulaId}`
    );
  }

  await sql`
    DELETE FROM public.substance_formula
    WHERE substance_id = ${substanceId} AND formula_id = ${formulaId}
  `;

  return { success: true };
}

export async function updateSubstanceInFormula(
  formulaId: number,
  substanceId: number,
  data: {
    concentration?: number | null;
    unit?: string | null;
    supplier?: string | null;
    dilution?: string | null;
    price_per_kg?: number | null;
    pyramid_position?: string | null;
    phase?: string | null;
  }
) {
  const userId = await getUserId();

  const { concentration, unit, supplier, dilution, price_per_kg, pyramid_position, phase } = data;

  // Check formula exists and user has edit access
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    UPDATE public.substance_formula
    SET
      concentration = COALESCE(${concentration ?? null}, concentration),
      unit = COALESCE(${unit || null}, unit),
      supplier = ${supplier ?? null},
      dilution = ${dilution ?? null},
      price_per_kg = ${price_per_kg ?? null},
      pyramid_position = ${pyramid_position ?? null},
      phase = ${phase ?? null}
    WHERE substance_id = ${substanceId} AND formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function updateFormulaStatus(
  formulaId: number,
  status: FormulaStatusValue
) {
  const userId = await getUserId();

  // Validate status
  if (!isValidFormulaStatus(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    UPDATE public.formula
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function updateFormula(
  formulaId: number,
  data: {
    name?: string;
    description?: string;
    notes?: string | null;
    is_public?: boolean;
    category_id?: number | null;
    status?: string;
    base_unit?: string;
  }
) {
  const userId = await getUserId();

  // Validate with Zod
  const validation = updateFormulaSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid formula data");
  }

  const validatedData = validation.data;

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT
      f.*,
      CASE WHEN f.user_id = ${userId} THEN true ELSE false END as is_owner,
      wm.role as workspace_role
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const existing = accessCheck[0];

  // Merge validated data with existing values
  // undefined = keep existing, null = clear, value = update
  const finalData = {
    name: validatedData.name ?? existing.name,
    description: validatedData.description !== undefined ? validatedData.description : existing.description,
    notes: validatedData.notes !== undefined ? validatedData.notes : existing.notes,
    is_public: validatedData.is_public ?? existing.is_public,
    category_id: validatedData.category_id !== undefined ? validatedData.category_id : existing.category_id,
    status: validatedData.status ?? existing.status,
    base_unit: validatedData.base_unit ?? existing.base_unit,
  };

  const result = await sql`
    UPDATE public.formula
    SET
      name = ${finalData.name},
      description = ${finalData.description},
      notes = ${finalData.notes},
      is_public = ${finalData.is_public},
      category_id = ${finalData.category_id},
      status = ${finalData.status},
      base_unit = ${finalData.base_unit},
      updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function duplicateFormula(formulaId: number, newName?: string) {
  const userId = await getUserId();

  // Get original formula - check if user owns it, has shared access, OR has workspace access
  const originalFormula = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (originalFormula.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const original = originalFormula[0];
  const duplicateName = newName || `${original.name} (Copy)`;

  // Create new formula (including cosmetic fields)
  const newFormulaResult = await sql`
    INSERT INTO public.formula (name, description, is_public, category_id, status, base_unit, user_id, flavor_profile, project_type, cosmetic_product_type, target_ph, preservative_system, manufacturing_notes)
    VALUES (${duplicateName}, ${original.description}, false, ${original.category_id}, 'draft', ${original.base_unit}, ${userId}, ${original.flavor_profile}::jsonb, ${original.project_type ?? "flavor"}, ${original.cosmetic_product_type ?? null}, ${original.target_ph ?? null}, ${original.preservative_system ?? null}, ${original.manufacturing_notes ?? null})
    RETURNING *
  `;

  const newFormula = newFormulaResult[0];

  // Copy substances
  const originalSubstances = await sql`
    SELECT * FROM public.substance_formula WHERE formula_id = ${formulaId}
  `;

  for (const sub of originalSubstances) {
    await sql`
      INSERT INTO public.substance_formula (substance_id, formula_id, concentration, unit, order_index, supplier, dilution, price_per_kg, pyramid_position, phase)
      VALUES (${sub.substance_id}, ${newFormula.formula_id}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}, ${sub.supplier}, ${sub.dilution}, ${sub.price_per_kg}, ${sub.pyramid_position}, ${sub.phase ?? null})
    `;
  }

  // Copy ingredient formulas (compounds)
  const originalIngredients = await sql`
    SELECT * FROM public.ingredient_formula WHERE parent_formula_id = ${formulaId}
  `;

  for (const ing of originalIngredients) {
    await sql`
      INSERT INTO public.ingredient_formula (parent_formula_id, ingredient_formula_id, concentration, unit, order_index)
      VALUES (${newFormula.formula_id}, ${ing.ingredient_formula_id}, ${ing.concentration}, ${ing.unit}, ${ing.order_index})
    `;
  }

  // Track formula duplication in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "formula_duplicated",
    properties: {
      original_formula_id: formulaId,
      new_formula_id: newFormula.formula_id,
      new_formula_name: duplicateName,
      substance_count: originalSubstances.length,
    },
  });

  return newFormula;
}

export async function deleteFormula(formulaId: number) {
  const userId = await getUserId();

  // Check formula exists and belongs to user
  const formulaCheck = await sql`
    SELECT * FROM public.formula WHERE formula_id = ${formulaId} AND user_id = ${userId}
  `;

  if (formulaCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const formulaName = formulaCheck[0].name;

  // Delete substance links first
  await sql`DELETE FROM public.substance_formula WHERE formula_id = ${formulaId}`;

  // Delete ingredient formula links (both as parent and as ingredient)
  await sql`DELETE FROM public.ingredient_formula WHERE parent_formula_id = ${formulaId}`;
  await sql`DELETE FROM public.ingredient_formula WHERE ingredient_formula_id = ${formulaId}`;

  // Delete formula
  await sql`DELETE FROM public.formula WHERE formula_id = ${formulaId} AND user_id = ${userId}`;

  // Track formula deletion in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "formula_deleted",
    properties: {
      formula_id: formulaId,
      formula_name: formulaName,
    },
  });

  return { success: true };
}

export async function updateFlavorProfile(
  formulaId: number,
  flavorProfile: Array<{ attribute: string; value: number }>
) {
  const userId = await getUserId();

  // Validate the flavor profile structure
  if (!Array.isArray(flavorProfile)) {
    throw new Error("Flavor profile must be an array");
  }

  for (const item of flavorProfile) {
    if (typeof item.attribute !== "string" || item.attribute.trim() === "") {
      throw new Error("Each attribute must have a non-empty name");
    }
    if (typeof item.value !== "number" || item.value < 0 || item.value > 100) {
      throw new Error("Each value must be a number between 0 and 100");
    }
  }

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    UPDATE public.formula
    SET flavor_profile = ${JSON.stringify(flavorProfile)}::jsonb, updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function updateFormulaNotes(
  formulaId: number,
  notes: string | null
) {
  const userId = await getUserId();

  // Validate notes length
  if (notes && notes.length > 10000) {
    throw new Error("Notes must be less than 10000 characters");
  }

  // Check formula exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    UPDATE public.formula
    SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function updateCosmeticDetails(
  formulaId: number,
  data: {
    cosmetic_product_type?: string | null;
    target_ph?: number | null;
    preservative_system?: string | null;
    manufacturing_notes?: string | null;
  }
) {
  const userId = await getUserId();

  const { cosmetic_product_type, target_ph, preservative_system, manufacturing_notes } = data;

  // Validate target_ph range
  if (target_ph != null && (target_ph < 0 || target_ph > 14)) {
    throw new Error("Target pH must be between 0 and 14");
  }

  // Check formula exists and user has edit access
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const existing = accessCheck[0];

  const result = await sql`
    UPDATE public.formula
    SET
      cosmetic_product_type = ${cosmetic_product_type !== undefined ? cosmetic_product_type : existing.cosmetic_product_type},
      target_ph = ${target_ph !== undefined ? target_ph : existing.target_ph},
      preservative_system = ${preservative_system !== undefined ? preservative_system : existing.preservative_system},
      manufacturing_notes = ${manufacturing_notes !== undefined ? manufacturing_notes : existing.manufacturing_notes},
      updated_at = CURRENT_TIMESTAMP
    WHERE formula_id = ${formulaId}
    RETURNING *
  `;

  return result[0];
}

export async function updateSubstancePhase(
  formulaId: number,
  substanceId: number,
  phase: string | null
) {
  const userId = await getUserId();

  // Check formula exists and user has edit access
  const accessCheck = await sql`
    SELECT f.*
    FROM public.formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const result = await sql`
    UPDATE public.substance_formula
    SET phase = ${phase}
    WHERE substance_id = ${substanceId} AND formula_id = ${formulaId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Substance not found in formula");
  }

  return result[0];
}
