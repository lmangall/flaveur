"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import type { Substance } from "@/app/type";
import { checkDuplicateSubstance } from "./contributions";
import type { FormulationData } from "@/lib/formulation-parser";

// Re-export types from the parser
export type { FormulationIngredient, FormulationVersion, FormulationData } from "@/lib/formulation-parser";

export type SubstanceMatchResult = {
  ingredient_name: string;
  status: "found" | "fuzzy_match" | "created" | "not_found";
  substance_id?: number;
  substance_name?: string;
  similarity?: number;
  message?: string;
};

export type FormulationImportResult = {
  success: boolean;
  flavour_id?: number;
  flavour_name?: string;
  substance_matches: SubstanceMatchResult[];
  errors: string[];
};

// ===========================================
// SUBSTANCE SEARCH HELPERS
// ===========================================

/**
 * Search for a substance by exact name match (case-insensitive)
 */
async function findSubstanceByExactName(name: string): Promise<Substance | null> {
  const normalizedName = name.trim().toLowerCase();

  const result = await sql`
    SELECT * FROM substance
    WHERE LOWER(common_name) = ${normalizedName}
    LIMIT 1
  `;

  if (result.length > 0) {
    return result[0] as Substance;
  }

  // Also check alternative names
  const altResult = await sql`
    SELECT * FROM substance
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(alternative_names) AS alt_name
      WHERE LOWER(alt_name) = ${normalizedName}
    )
    LIMIT 1
  `;

  return altResult.length > 0 ? (altResult[0] as Substance) : null;
}

/**
 * Search for a substance using fuzzy matching
 */
async function findSubstanceByFuzzyMatch(
  name: string,
  threshold: number = 0.3
): Promise<{ substance: Substance; similarity: number } | null> {
  if (!name || name.trim().length < 2) {
    return null;
  }

  const results = await sql`
    SELECT * FROM search_substances_fuzzy(${name}, ${threshold}, 1)
  `;

  if (results.length > 0) {
    const match = results[0] as Substance & { similarity?: number };
    return {
      substance: match,
      similarity: match.similarity ?? 0,
    };
  }

  return null;
}

// ===========================================
// MAIN IMPORT PIPELINE
// ===========================================

/**
 * Process a formulation and create a flavour
 *
 * Pipeline:
 * 1. For each ingredient, search in DB by name
 * 2. If not found exactly, use fuzzy search
 * 3. If still not found, create a minimal substance (user_entry)
 * 4. Create the flavour with all found/created substances
 */
export async function importFormulation(
  data: FormulationData,
  options: {
    version_to_import: string; // Which version (A, B, C...) to import
    auto_create_substances: boolean; // Whether to create missing substances
    fuzzy_threshold?: number; // Similarity threshold for fuzzy matching (0-1)
  }
): Promise<FormulationImportResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const errors: string[] = [];
  const substanceMatches: SubstanceMatchResult[] = [];
  const fuzzyThreshold = options.fuzzy_threshold ?? 0.4;

  // Find the version to import
  const version = data.versions.find(v => v.version_label === options.version_to_import);
  if (!version) {
    return {
      success: false,
      substance_matches: [],
      errors: [`Version "${options.version_to_import}" not found in formulation data`],
    };
  }

  // Process each ingredient
  const substancesToAdd: Array<{
    substance_id: number;
    concentration: number;
    order_index: number;
  }> = [];

  for (let i = 0; i < version.ingredients.length; i++) {
    const ingredient = version.ingredients[i];

    if (!ingredient.name || ingredient.name.trim() === "") {
      continue; // Skip empty rows
    }

    // Step 1: Try exact match
    let substance = await findSubstanceByExactName(ingredient.name);

    if (substance) {
      substanceMatches.push({
        ingredient_name: ingredient.name,
        status: "found",
        substance_id: substance.substance_id,
        substance_name: substance.common_name,
      });

      substancesToAdd.push({
        substance_id: substance.substance_id,
        concentration: ingredient.concentration,
        order_index: i + 1,
      });
      continue;
    }

    // Step 2: Try fuzzy match
    const fuzzyResult = await findSubstanceByFuzzyMatch(ingredient.name, fuzzyThreshold);

    if (fuzzyResult && fuzzyResult.similarity >= fuzzyThreshold) {
      substanceMatches.push({
        ingredient_name: ingredient.name,
        status: "fuzzy_match",
        substance_id: fuzzyResult.substance.substance_id,
        substance_name: fuzzyResult.substance.common_name,
        similarity: fuzzyResult.similarity,
        message: `Matched to "${fuzzyResult.substance.common_name}" with ${Math.round(fuzzyResult.similarity * 100)}% similarity`,
      });

      substancesToAdd.push({
        substance_id: fuzzyResult.substance.substance_id,
        concentration: ingredient.concentration,
        order_index: i + 1,
      });
      continue;
    }

    // Step 3: Create new substance if auto_create is enabled
    if (options.auto_create_substances) {
      try {
        // Check if it already exists (case-insensitive)
        const duplicateCheck = await checkDuplicateSubstance(ingredient.name);

        if (duplicateCheck.exists && duplicateCheck.matchedSubstance?.substance_id) {
          // Use existing substance
          substanceMatches.push({
            ingredient_name: ingredient.name,
            status: "found",
            substance_id: duplicateCheck.matchedSubstance.substance_id,
            substance_name: duplicateCheck.matchedSubstance.common_name,
            message: "Found via duplicate check",
          });

          substancesToAdd.push({
            substance_id: duplicateCheck.matchedSubstance.substance_id,
            concentration: ingredient.concentration,
            order_index: i + 1,
          });
          continue;
        }

        // Create minimal substance entry (to be enriched later)
        const newSubstance = await sql`
          INSERT INTO substance (
            common_name,
            odor,
            verification_status,
            submitted_by_user_id,
            submitted_at,
            source_reference
          )
          VALUES (
            ${ingredient.name.trim()},
            'Imported from formulation - needs enrichment',
            'user_entry',
            ${userId},
            CURRENT_TIMESTAMP,
            'Formulation import'
          )
          RETURNING *
        `;

        const createdSubstance = newSubstance[0] as Substance;

        substanceMatches.push({
          ingredient_name: ingredient.name,
          status: "created",
          substance_id: createdSubstance.substance_id,
          substance_name: createdSubstance.common_name,
          message: "Created new substance (needs enrichment)",
        });

        substancesToAdd.push({
          substance_id: createdSubstance.substance_id,
          concentration: ingredient.concentration,
          order_index: i + 1,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to create substance "${ingredient.name}": ${errorMessage}`);

        substanceMatches.push({
          ingredient_name: ingredient.name,
          status: "not_found",
          message: `Failed to create: ${errorMessage}`,
        });
      }
    } else {
      // Not auto-creating - mark as not found
      substanceMatches.push({
        ingredient_name: ingredient.name,
        status: "not_found",
        message: "No match found and auto-create is disabled",
      });

      errors.push(`Substance not found: "${ingredient.name}"`);
    }
  }

  // If we have no substances to add, don't create the flavour
  if (substancesToAdd.length === 0) {
    return {
      success: false,
      substance_matches: substanceMatches,
      errors: [...errors, "No substances could be matched or created"],
    };
  }

  // Create the flavour
  try {
    const flavourName = data.formula_name || `Imported Formulation ${new Date().toISOString().split('T')[0]}`;

    const flavourResult = await sql`
      INSERT INTO flavour (
        name,
        description,
        is_public,
        status,
        base_unit,
        user_id
      )
      VALUES (
        ${flavourName},
        ${`Imported from formulation sheet. Version: ${options.version_to_import}${data.student_name ? `. Student: ${data.student_name}` : ""}${data.formulation_date ? `. Date: ${data.formulation_date}` : ""}`},
        false,
        'draft',
        '%(v/v)',
        ${userId}
      )
      RETURNING *
    `;

    const newFlavour = flavourResult[0] as { flavour_id: number; name: string };

    // Add all substances to the flavour
    for (const sub of substancesToAdd) {
      await sql`
        INSERT INTO substance_flavour (substance_id, flavour_id, concentration, unit, order_index)
        VALUES (${sub.substance_id}, ${newFlavour.flavour_id}, ${sub.concentration}, '%(v/v)', ${sub.order_index})
      `;
    }

    return {
      success: true,
      flavour_id: newFlavour.flavour_id,
      flavour_name: newFlavour.name,
      substance_matches: substanceMatches,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      substance_matches: substanceMatches,
      errors: [...errors, `Failed to create flavour: ${errorMessage}`],
    };
  }
}

// ===========================================
// PREVIEW HELPER (dry run)
// ===========================================

/**
 * Preview what would happen during import (without creating anything)
 */
export async function previewFormulationImport(
  data: FormulationData,
  options: {
    version_to_import: string;
    fuzzy_threshold?: number;
  }
): Promise<{
  version_found: boolean;
  ingredient_count: number;
  substance_matches: SubstanceMatchResult[];
}> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const fuzzyThreshold = options.fuzzy_threshold ?? 0.4;
  const substanceMatches: SubstanceMatchResult[] = [];

  const version = data.versions.find(v => v.version_label === options.version_to_import);
  if (!version) {
    return {
      version_found: false,
      ingredient_count: 0,
      substance_matches: [],
    };
  }

  for (const ingredient of version.ingredients) {
    if (!ingredient.name || ingredient.name.trim() === "") {
      continue;
    }

    // Try exact match
    const substance = await findSubstanceByExactName(ingredient.name);

    if (substance) {
      substanceMatches.push({
        ingredient_name: ingredient.name,
        status: "found",
        substance_id: substance.substance_id,
        substance_name: substance.common_name,
      });
      continue;
    }

    // Try fuzzy match
    const fuzzyResult = await findSubstanceByFuzzyMatch(ingredient.name, fuzzyThreshold);

    if (fuzzyResult && fuzzyResult.similarity >= fuzzyThreshold) {
      substanceMatches.push({
        ingredient_name: ingredient.name,
        status: "fuzzy_match",
        substance_id: fuzzyResult.substance.substance_id,
        substance_name: fuzzyResult.substance.common_name,
        similarity: fuzzyResult.similarity,
        message: `Potential match: "${fuzzyResult.substance.common_name}" (${Math.round(fuzzyResult.similarity * 100)}% similarity)`,
      });
      continue;
    }

    // Not found
    substanceMatches.push({
      ingredient_name: ingredient.name,
      status: "not_found",
      message: "Will need to be created",
    });
  }

  return {
    version_found: true,
    ingredient_count: version.ingredients.filter(i => i.name && i.name.trim() !== "").length,
    substance_matches: substanceMatches,
  };
}
