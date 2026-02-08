"use server";

import { getUserId } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import { getPostHogClient } from "@/lib/posthog-server";
import type { Formula, IngredientInFormula, SubstanceInFormula } from "@/app/type";

export type CompoundSearchResult = {
  formula_id: number;
  name: string;
  description: string | null;
  ingredient_count: number;
  source: "own" | "shared" | "workspace";
};

export type CompoundWithIngredients = IngredientInFormula & {
  ingredient: Formula & {
    substances: SubstanceInFormula[];
  };
};

/**
 * Search formulas that can be used as ingredients (compounds)
 * Returns formulas user has access to, excluding the current formula and its ancestors
 */
export async function searchCompoundFormulas(
  query: string,
  excludeFormulaId?: number
): Promise<CompoundSearchResult[]> {
  const userId = await getUserId();

  // Get formulas user can access (own, shared, workspace)
  // Exclude the current formula to prevent self-reference
  const results = await sql`
    WITH accessible_formulas AS (
      SELECT DISTINCT ON (f.formula_id)
        f.formula_id,
        f.name,
        f.description,
        CASE
          WHEN f.user_id = ${userId} THEN 'own'
          WHEN fs.share_id IS NOT NULL THEN 'shared'
          WHEN wm.member_id IS NOT NULL THEN 'workspace'
        END as source
      FROM formula f
      LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
        AND fs.shared_with_user_id = ${userId}
      LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
      LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
        AND wm.user_id = ${userId}
      WHERE (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
        AND f.formula_id != ${excludeFormulaId ?? -1}
        AND (
          ${query} = ''
          OR f.name ILIKE ${"%" + query + "%"}
          OR f.description ILIKE ${"%" + query + "%"}
        )
      ORDER BY f.formula_id,
        CASE
          WHEN f.user_id = ${userId} THEN 1
          WHEN wm.member_id IS NOT NULL THEN 2
          ELSE 3
        END
    )
    SELECT
      af.*,
      COALESCE(
        (SELECT COUNT(*) FROM substance_formula sf WHERE sf.formula_id = af.formula_id),
        0
      ) + COALESCE(
        (SELECT COUNT(*) FROM ingredient_formula inf WHERE inf.parent_formula_id = af.formula_id),
        0
      ) as ingredient_count
    FROM accessible_formulas af
    ORDER BY
      CASE WHEN af.source = 'own' THEN 0 ELSE 1 END,
      af.name
    LIMIT 20
  `;

  return results.map((r) => ({
    formula_id: Number(r.formula_id),
    name: String(r.name),
    description: r.description ? String(r.description) : null,
    ingredient_count: Number(r.ingredient_count),
    source: String(r.source) as "own" | "shared" | "workspace",
  }));
}

/**
 * Check if adding ingredientId to parentId would create a circular dependency
 * Returns true if circular dependency exists
 */
export async function checkCircularDependency(
  parentFormulaId: number,
  ingredientFormulaId: number
): Promise<boolean> {
  // Cannot add self as ingredient
  if (parentFormulaId === ingredientFormulaId) {
    return true;
  }

  // Check if parent is used (directly or indirectly) in the ingredient
  // Use recursive CTE to traverse the ingredient tree
  const result = await sql`
    WITH RECURSIVE ingredient_tree AS (
      -- Base case: direct ingredients of the candidate
      SELECT parent_formula_id, ingredient_formula_id, 1 as depth
      FROM ingredient_formula
      WHERE parent_formula_id = ${ingredientFormulaId}

      UNION ALL

      -- Recursive case: ingredients of ingredients
      SELECT inf.parent_formula_id, inf.ingredient_formula_id, it.depth + 1
      FROM ingredient_formula inf
      INNER JOIN ingredient_tree it ON inf.parent_formula_id = it.ingredient_formula_id
      WHERE it.depth < 10  -- Prevent infinite loops, max 10 levels deep
    )
    SELECT 1 FROM ingredient_tree
    WHERE ingredient_formula_id = ${parentFormulaId}
    LIMIT 1
  `;

  return result.length > 0;
}

/**
 * Add a compound (formula) as ingredient to a parent formula
 */
export async function addCompoundToFormula(
  parentFormulaId: number,
  ingredientFormulaId: number,
  data: {
    concentration: number;
    unit: string;
    order_index: number;
  }
): Promise<IngredientInFormula> {
  const userId = await getUserId();

  const { concentration, unit, order_index } = data;

  // Check parent formula exists and user has edit access
  const parentCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${parentFormulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (parentCheck.length === 0) {
    throw new Error("Parent formula not found or access denied");
  }

  // Check ingredient formula exists and user has at least read access
  const ingredientCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${ingredientFormulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (ingredientCheck.length === 0) {
    throw new Error("Ingredient formula not found or access denied");
  }

  // Check for circular dependency
  const isCircular = await checkCircularDependency(parentFormulaId, ingredientFormulaId);
  if (isCircular) {
    throw new Error("Cannot add this formula as ingredient - it would create a circular dependency");
  }

  // Check if already added
  const existingCheck = await sql`
    SELECT * FROM ingredient_formula
    WHERE parent_formula_id = ${parentFormulaId}
      AND ingredient_formula_id = ${ingredientFormulaId}
  `;

  if (existingCheck.length > 0) {
    throw new Error("This formula is already added as an ingredient");
  }

  // Insert the ingredient relationship
  const result = await sql`
    INSERT INTO ingredient_formula (parent_formula_id, ingredient_formula_id, concentration, unit, order_index)
    VALUES (${parentFormulaId}, ${ingredientFormulaId}, ${concentration}, ${unit}, ${order_index})
    RETURNING *
  `;

  // Track in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "compound_added_to_formula",
    properties: {
      parent_formula_id: parentFormulaId,
      ingredient_formula_id: ingredientFormulaId,
      ingredient_name: ingredientCheck[0].name,
      concentration,
      unit,
    },
  });

  return {
    ingredient_formula_id: Number(result[0].ingredient_formula_id),
    concentration: Number(result[0].concentration),
    unit: String(result[0].unit) as IngredientInFormula["unit"],
    order_index: Number(result[0].order_index),
  };
}

/**
 * Update a compound ingredient's concentration or unit
 */
export async function updateCompoundInFormula(
  parentFormulaId: number,
  ingredientFormulaId: number,
  data: {
    concentration?: number;
    unit?: string;
  }
): Promise<IngredientInFormula> {
  const userId = await getUserId();

  const { concentration, unit } = data;

  // Check parent formula exists and user has edit access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${parentFormulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  // Check the ingredient relationship exists
  const existingCheck = await sql`
    SELECT * FROM ingredient_formula
    WHERE parent_formula_id = ${parentFormulaId}
      AND ingredient_formula_id = ${ingredientFormulaId}
  `;

  if (existingCheck.length === 0) {
    throw new Error("Ingredient not found in formula");
  }

  const result = await sql`
    UPDATE ingredient_formula
    SET
      concentration = COALESCE(${concentration ?? null}, concentration),
      unit = COALESCE(${unit ?? null}, unit)
    WHERE parent_formula_id = ${parentFormulaId}
      AND ingredient_formula_id = ${ingredientFormulaId}
    RETURNING *
  `;

  return {
    ingredient_formula_id: Number(result[0].ingredient_formula_id),
    concentration: Number(result[0].concentration),
    unit: String(result[0].unit) as IngredientInFormula["unit"],
    order_index: Number(result[0].order_index),
  };
}

/**
 * Remove a compound ingredient from a formula
 */
export async function removeCompoundFromFormula(
  parentFormulaId: number,
  ingredientFormulaId: number
): Promise<{ success: boolean }> {
  const userId = await getUserId();

  // Check parent formula exists and user has edit access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${parentFormulaId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  // Check the ingredient relationship exists
  const existingCheck = await sql`
    SELECT * FROM ingredient_formula
    WHERE parent_formula_id = ${parentFormulaId}
      AND ingredient_formula_id = ${ingredientFormulaId}
  `;

  if (existingCheck.length === 0) {
    throw new Error("Ingredient not found in formula");
  }

  await sql`
    DELETE FROM ingredient_formula
    WHERE parent_formula_id = ${parentFormulaId}
      AND ingredient_formula_id = ${ingredientFormulaId}
  `;

  // Track in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "compound_removed_from_formula",
    properties: {
      parent_formula_id: parentFormulaId,
      ingredient_formula_id: ingredientFormulaId,
    },
  });

  return { success: true };
}

/**
 * Get all compound ingredients for a formula with their nested substances
 */
export async function getCompoundsForFormula(
  formulaId: number
): Promise<CompoundWithIngredients[]> {
  const userId = await getUserId();

  // Check access to the formula
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  // Get ingredient formulas with junction data
  const ingredients = await sql`
    SELECT
      inf.ingredient_formula_id,
      inf.concentration,
      inf.unit,
      inf.order_index,
      f.formula_id,
      f.name,
      f.description,
      f.base_unit,
      f.flavor_profile,
      f.status,
      f.version
    FROM ingredient_formula inf
    JOIN formula f ON inf.ingredient_formula_id = f.formula_id
    WHERE inf.parent_formula_id = ${formulaId}
    ORDER BY inf.order_index
  `;

  // For each ingredient formula, get its substances
  const result: CompoundWithIngredients[] = [];

  for (const ing of ingredients) {
    const substances = await sql`
      SELECT
        s.*,
        sf.concentration,
        sf.unit,
        sf.order_index,
        sf.supplier,
        sf.dilution,
        sf.price_per_kg,
        sf.pyramid_position
      FROM substance_formula sf
      JOIN substance s ON sf.substance_id = s.substance_id
      WHERE sf.formula_id = ${ing.ingredient_formula_id}
      ORDER BY sf.order_index
    `;

    result.push({
      ingredient_formula_id: Number(ing.ingredient_formula_id),
      concentration: Number(ing.concentration),
      unit: String(ing.unit) as IngredientInFormula["unit"],
      order_index: Number(ing.order_index),
      ingredient: {
        formula_id: Number(ing.formula_id),
        name: String(ing.name),
        description: ing.description ? String(ing.description) : null,
        notes: null,
        is_public: true,
        user_id: null,
        category_id: null,
        status: String(ing.status) as Formula["status"],
        version: Number(ing.version),
        base_unit: String(ing.base_unit) as Formula["base_unit"],
        flavor_profile: ing.flavor_profile as Formula["flavor_profile"],
        created_at: "",
        updated_at: "",
        project_type: "flavor",
        concentration_type: null,
        substances: substances.map((s) => ({
          substance_id: Number(s.substance_id),
          concentration: Number(s.concentration),
          unit: String(s.unit) as SubstanceInFormula["unit"],
          order_index: Number(s.order_index),
          supplier: s.supplier ? String(s.supplier) : null,
          dilution: s.dilution ? String(s.dilution) : null,
          price_per_kg: s.price_per_kg ? Number(s.price_per_kg) : null,
          pyramid_position: s.pyramid_position as SubstanceInFormula["pyramid_position"],
          substance: {
            substance_id: Number(s.substance_id),
            fema_number: s.fema_number ? Number(s.fema_number) : null,
            common_name: String(s.common_name),
            cas_id: s.cas_id ? String(s.cas_id) : null,
            iupac_name: s.iupac_name ? String(s.iupac_name) : null,
            fl_number: s.fl_number ? String(s.fl_number) : null,
            coe_number: s.coe_number ? String(s.coe_number) : null,
            jecfa_number: s.jecfa_number ? Number(s.jecfa_number) : null,
            molecular_weight: s.molecular_weight ? Number(s.molecular_weight) : null,
            molecular_formula: s.molecular_formula ? String(s.molecular_formula) : null,
            exact_mass: s.exact_mass ? Number(s.exact_mass) : null,
            smile: s.smile ? String(s.smile) : null,
            inchi: s.inchi ? String(s.inchi) : null,
            xlogp: s.xlogp ? Number(s.xlogp) : null,
            synthetic: s.synthetic as boolean | null,
            is_natural: s.is_natural as boolean | null,
            unknown_natural: s.unknown_natural as boolean | null,
            functional_groups: s.functional_groups ? String(s.functional_groups) : null,
            flavor_profile: s.flavor_profile ? String(s.flavor_profile) : null,
            fema_flavor_profile: s.fema_flavor_profile ? String(s.fema_flavor_profile) : null,
            olfactory_taste_notes: s.olfactory_taste_notes ? String(s.olfactory_taste_notes) : null,
            odor: s.odor ? String(s.odor) : null,
            taste: s.taste ? String(s.taste) : null,
            pubchem_id: s.pubchem_id ? Number(s.pubchem_id) : null,
            solubility: s.solubility as Record<string, string> | null,
            food_additive_classes: s.food_additive_classes as string[] | null,
            alternative_names: s.alternative_names as string[] | null,
            melting_point_c: s.melting_point_c ? String(s.melting_point_c) : null,
            boiling_point_c: s.boiling_point_c ? String(s.boiling_point_c) : null,
            description: s.description ? String(s.description) : null,
            created_at: String(s.created_at),
            updated_at: String(s.updated_at),
            volatility_class: s.volatility_class ? String(s.volatility_class) : null,
            olfactive_family: s.olfactive_family ? String(s.olfactive_family) : null,
            odor_profile_tags: s.odor_profile_tags as string[] | null,
            substantivity: s.substantivity ? String(s.substantivity) : null,
            performance_notes: s.performance_notes ? String(s.performance_notes) : null,
            uses_in_perfumery: s.uses_in_perfumery ? String(s.uses_in_perfumery) : null,
            use_level: s.use_level ? String(s.use_level) : null,
            stability_notes: s.stability_notes ? String(s.stability_notes) : null,
            price_range: s.price_range ? String(s.price_range) : null,
            is_blend: s.is_blend as boolean | null,
            botanical_name: s.botanical_name ? String(s.botanical_name) : null,
            extraction_process: s.extraction_process ? String(s.extraction_process) : null,
            major_components: s.major_components ? String(s.major_components) : null,
            vegan: s.vegan as boolean | null,
            biodegradability: s.biodegradability ? String(s.biodegradability) : null,
            renewable_pct: s.renewable_pct ? String(s.renewable_pct) : null,
            appearance: s.appearance ? String(s.appearance) : null,
            density: s.density ? String(s.density) : null,
            refractive_index: s.refractive_index ? String(s.refractive_index) : null,
            optical_rotation: s.optical_rotation ? String(s.optical_rotation) : null,
            flash_point: s.flash_point ? String(s.flash_point) : null,
            vapor_pressure: s.vapor_pressure ? String(s.vapor_pressure) : null,
            inchikey: s.inchikey ? String(s.inchikey) : null,
            log_p: s.log_p ? String(s.log_p) : null,
            source_datasets: s.source_datasets ? String(s.source_datasets) : null,
            review_flags: s.review_flags ? String(s.review_flags) : null,
            pubchem_enriched: s.pubchem_enriched as boolean | null,
            domain: s.domain as "flavor" | "fragrance" | "both" | null,
            verification_status: s.verification_status,
            submitted_by_user_id: s.submitted_by_user_id ? String(s.submitted_by_user_id) : null,
            submitted_at: s.submitted_at ? String(s.submitted_at) : null,
            reviewed_by_admin_email: s.reviewed_by_admin_email ? String(s.reviewed_by_admin_email) : null,
            reviewed_at: s.reviewed_at ? String(s.reviewed_at) : null,
            admin_notes: s.admin_notes ? String(s.admin_notes) : null,
            source_reference: s.source_reference ? String(s.source_reference) : null,
          },
        })),
      },
    });
  }

  return result;
}

/**
 * Get formulas that use a specific formula as an ingredient
 */
export async function getFormulasUsingAsIngredient(
  formulaId: number
): Promise<{ formula_id: number; name: string; owner_name: string | null }[]> {
  const userId = await getUserId();

  // Get parent formulas that use this formula as ingredient
  // Only show ones the user has access to
  const results = await sql`
    SELECT DISTINCT
      f.formula_id,
      f.name,
      u.username as owner_name
    FROM ingredient_formula inf
    JOIN formula f ON inf.parent_formula_id = f.formula_id
    LEFT JOIN users u ON f.user_id = u.user_id
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE inf.ingredient_formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
    ORDER BY f.name
  `;

  return results.map((r) => ({
    formula_id: Number(r.formula_id),
    name: String(r.name),
    owner_name: r.owner_name ? String(r.owner_name) : null,
  }));
}

export type FlattenedIngredient = {
  substance_id: number;
  common_name: string;
  fema_number: number | null;
  total_concentration: number;
  unit: string;
  sources: Array<{
    formula_id: number;
    formula_name: string;
    contribution: number;
  }>;
};

/**
 * Get flattened view of all raw substances (recursively resolving compounds)
 */
export async function getFlattenedIngredients(
  formulaId: number
): Promise<FlattenedIngredient[]> {
  const userId = await getUserId();

  // Check access
  const accessCheck = await sql`
    SELECT f.*
    FROM formula f
    LEFT JOIN formula_shares fs ON f.formula_id = fs.formula_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_formula wf ON f.formula_id = wf.formula_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.formula_id = ${formulaId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Formula not found or access denied");
  }

  const formulaName = String(accessCheck[0].name);

  // Map to aggregate substances by ID
  const substanceMap = new Map<number, FlattenedIngredient>();

  // Helper to add substances from a formula
  async function processFormula(
    fId: number,
    fName: string,
    multiplier: number = 1
  ) {
    // Get direct substances
    const substances = await sql`
      SELECT
        s.substance_id,
        s.common_name,
        s.fema_number,
        sf.concentration,
        sf.unit
      FROM substance_formula sf
      JOIN substance s ON sf.substance_id = s.substance_id
      WHERE sf.formula_id = ${fId}
    `;

    for (const sub of substances) {
      const substanceId = Number(sub.substance_id);
      const contribution = Number(sub.concentration) * multiplier;

      if (substanceMap.has(substanceId)) {
        const existing = substanceMap.get(substanceId)!;
        existing.total_concentration += contribution;
        existing.sources.push({
          formula_id: fId,
          formula_name: fName,
          contribution,
        });
      } else {
        substanceMap.set(substanceId, {
          substance_id: substanceId,
          common_name: String(sub.common_name),
          fema_number: sub.fema_number ? Number(sub.fema_number) : null,
          total_concentration: contribution,
          unit: String(sub.unit),
          sources: [
            {
              formula_id: fId,
              formula_name: fName,
              contribution,
            },
          ],
        });
      }
    }

    // Get nested compounds and process recursively
    const compounds = await sql`
      SELECT
        inf.ingredient_formula_id,
        inf.concentration,
        f.name
      FROM ingredient_formula inf
      JOIN formula f ON inf.ingredient_formula_id = f.formula_id
      WHERE inf.parent_formula_id = ${fId}
    `;

    for (const comp of compounds) {
      // Calculate concentration multiplier for nested compound
      // If parent uses 100 g/kg of a compound, and compound has 50 g/kg of X,
      // then contribution is (100/1000) * 50 = 5 g/kg
      const compMultiplier = (Number(comp.concentration) / 1000) * multiplier;
      await processFormula(
        Number(comp.ingredient_formula_id),
        String(comp.name),
        compMultiplier
      );
    }
  }

  // Process the main formula
  await processFormula(formulaId, formulaName, 1);

  // Return sorted by total concentration
  return Array.from(substanceMap.values()).sort(
    (a, b) => b.total_concentration - a.total_concentration
  );
}
