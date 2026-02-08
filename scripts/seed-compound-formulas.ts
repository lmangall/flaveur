/**
 * Seed compound formulas to demonstrate nested formula functionality
 *
 * Creates:
 *   - Professional base formulas (Vanilla Base, Citrus Base, etc.)
 *   - Links base formulas as compound ingredients in existing demo formulas
 *
 * Usage:
 *   npx tsx scripts/seed-compound-formulas.ts
 *   npx tsx scripts/seed-compound-formulas.ts --dry-run
 *   npx tsx scripts/seed-compound-formulas.ts --clean
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - Demo users should already exist (run seed-demo-users.ts first)
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const cleanMode = args.includes("--clean");

// =============================================================================
// BASE COMPOUND FORMULAS
// These are professional base formulas that can be used as ingredients
// =============================================================================

interface SubstanceIngredient {
  common_name: string;
  concentration: number;
  unit: string;
  order_index: number;
  pyramid_position?: "top" | "heart" | "base";
}

interface FlavorProfileAttribute {
  attribute: string;
  value: number;
}

interface BaseFormula {
  name: string;
  description: string;
  base_unit: string;
  flavor_profile: FlavorProfileAttribute[];
  category_name: string;
  substances: SubstanceIngredient[];
  owner_user_id: string; // Who owns this base formula
}

// Professional base formulas owned by different demo users
const BASE_FORMULAS: BaseFormula[] = [
  // Arthur Dent's bases (vanilla/dairy specialist)
  {
    name: "Vanilla Base Extract",
    description:
      "Base vanille universelle. Profil équilibré pour incorporation dans desserts, crèmes et confiseries. Concentration d'utilisation typique: 30-80 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 70 },
      { attribute: "Sourness", value: 5 },
      { attribute: "Bitterness", value: 15 },
      { attribute: "Umami", value: 10 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Vanilla",
    owner_user_id: "demo_arthur_dent",
    substances: [
      {
        common_name: "Vanillin",
        concentration: 450.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "heart",
      },
      {
        common_name: "Ethyl vanillin",
        concentration: 80.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "heart",
      },
      {
        common_name: "Heliotropin",
        concentration: 25.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "heart",
      },
      {
        common_name: "Anisyl alcohol",
        concentration: 15.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "heart",
      },
      {
        common_name: "Guaiacol",
        concentration: 3.0,
        unit: "g/kg",
        order_index: 5,
        pyramid_position: "base",
      },
    ],
  },
  {
    name: "Dairy Cream Base",
    description:
      "Base crémeuse lactée pour notes beurre et crème fraîche. Idéale pour arômes laitiers, caramel beurré, et desserts crémeux. Usage: 20-50 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 25 },
      { attribute: "Sourness", value: 20 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 45 },
      { attribute: "Saltiness", value: 25 },
    ],
    category_name: "Dairy",
    owner_user_id: "demo_arthur_dent",
    substances: [
      {
        common_name: "Diacetyl",
        concentration: 180.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "top",
      },
      {
        common_name: "Acetoin",
        concentration: 120.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "heart",
      },
      {
        common_name: "delta-Decalactone",
        concentration: 60.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "base",
      },
      {
        common_name: "Butyric acid",
        concentration: 8.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "heart",
      },
    ],
  },
  // Ford Prefect's bases (citrus/fruit specialist)
  {
    name: "Citrus Zest Complex",
    description:
      "Complexe agrumes universel combinant citron, orange et pamplemousse. Base pour limonades, sodas et applications boulangères. Usage: 15-40 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 30 },
      { attribute: "Sourness", value: 70 },
      { attribute: "Bitterness", value: 25 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Citrus",
    owner_user_id: "demo_ford_prefect",
    substances: [
      {
        common_name: "Limonene",
        concentration: 350.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "top",
      },
      {
        common_name: "Citral",
        concentration: 80.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "top",
      },
      {
        common_name: "Linalool",
        concentration: 40.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "heart",
      },
      {
        common_name: "Octanal",
        concentration: 25.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "top",
      },
      {
        common_name: "Decanal",
        concentration: 15.0,
        unit: "g/kg",
        order_index: 5,
        pyramid_position: "top",
      },
    ],
  },
  {
    name: "Red Berry Accord",
    description:
      "Accord baies rouges (fraise, framboise, mûre) pour yaourts, confiseries et boissons. Notes fruitées intenses avec fond lactonique. Usage: 25-60 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 65 },
      { attribute: "Sourness", value: 40 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Berry",
    owner_user_id: "demo_ford_prefect",
    substances: [
      {
        common_name: "Ethyl butyrate",
        concentration: 200.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "top",
      },
      {
        common_name: "Furaneol",
        concentration: 80.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "heart",
      },
      {
        common_name: "gamma-Decalactone",
        concentration: 45.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "base",
      },
      {
        common_name: "cis-3-Hexenol",
        concentration: 12.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "top",
      },
      {
        common_name: "Linalool",
        concentration: 10.0,
        unit: "g/kg",
        order_index: 5,
        pyramid_position: "heart",
      },
    ],
  },
  // Trillian's bases (tropical/floral specialist)
  {
    name: "Tropical Fruit Complex",
    description:
      "Complexe fruits tropicaux (mangue, passion, ananas). Notes soufrées caractéristiques et fond crémeux. Pour boissons, desserts et confiseries. Usage: 20-50 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 60 },
      { attribute: "Sourness", value: 35 },
      { attribute: "Bitterness", value: 10 },
      { attribute: "Umami", value: 10 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Tropical",
    owner_user_id: "demo_trillian",
    substances: [
      {
        common_name: "Ethyl butyrate",
        concentration: 150.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "top",
      },
      {
        common_name: "gamma-Decalactone",
        concentration: 80.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "base",
      },
      {
        common_name: "delta-Decalactone",
        concentration: 40.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "base",
      },
      {
        common_name: "Linalool",
        concentration: 25.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "heart",
      },
      {
        common_name: "Furaneol",
        concentration: 35.0,
        unit: "g/kg",
        order_index: 5,
        pyramid_position: "heart",
      },
    ],
  },
  {
    name: "Floral Jasmine Accord",
    description:
      "Accord jasmin naturel pour notes florales élégantes. Utilisé comme modificateur dans arômes floraux et thés. Usage: 5-15 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 40 },
      { attribute: "Sourness", value: 10 },
      { attribute: "Bitterness", value: 20 },
      { attribute: "Umami", value: 15 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Floral",
    owner_user_id: "demo_trillian",
    substances: [
      {
        common_name: "Linalool",
        concentration: 280.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "heart",
      },
      {
        common_name: "Benzyl acetate",
        concentration: 120.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "heart",
      },
      {
        common_name: "cis-Jasmone",
        concentration: 45.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "heart",
      },
      {
        common_name: "Indole",
        concentration: 8.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "base",
      },
    ],
  },
  // Sweetness modulator - shared base
  {
    name: "Sweetness Modulator",
    description:
      "Complexe exhausteur de sucrosité pour réduction de sucre dans les formulations. Combine maltol, furaneol et vanilline pour perception sucrée accrue. Usage: 5-20 g/kg.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 90 },
      { attribute: "Sourness", value: 5 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 10 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Sweet",
    owner_user_id: "demo_arthur_dent",
    substances: [
      {
        common_name: "Maltol",
        concentration: 200.0,
        unit: "g/kg",
        order_index: 1,
        pyramid_position: "base",
      },
      {
        common_name: "Ethyl maltol",
        concentration: 100.0,
        unit: "g/kg",
        order_index: 2,
        pyramid_position: "base",
      },
      {
        common_name: "Furaneol",
        concentration: 80.0,
        unit: "g/kg",
        order_index: 3,
        pyramid_position: "heart",
      },
      {
        common_name: "Vanillin",
        concentration: 50.0,
        unit: "g/kg",
        order_index: 4,
        pyramid_position: "heart",
      },
      {
        common_name: "Cyclotene",
        concentration: 30.0,
        unit: "g/kg",
        order_index: 5,
        pyramid_position: "base",
      },
    ],
  },
];

// =============================================================================
// COMPOUND RELATIONSHIPS
// Link base formulas as ingredients in existing formulas
// =============================================================================

interface CompoundLink {
  parent_formula_name: string;
  parent_owner: string;
  ingredient_formula_name: string;
  concentration: number;
  unit: string;
  order_index: number;
}

const COMPOUND_LINKS: CompoundLink[] = [
  // Arthur's formulas using bases
  {
    parent_formula_name: "Vanille Bourbon Madagascar",
    parent_owner: "demo_arthur_dent",
    ingredient_formula_name: "Sweetness Modulator",
    concentration: 15.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Caramel au Beurre Salé",
    parent_owner: "demo_arthur_dent",
    ingredient_formula_name: "Dairy Cream Base",
    concentration: 35.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Caramel au Beurre Salé",
    parent_owner: "demo_arthur_dent",
    ingredient_formula_name: "Vanilla Base Extract",
    concentration: 20.0,
    unit: "g/kg",
    order_index: 11,
  },
  {
    parent_formula_name: "Crème Fraîche Normande",
    parent_owner: "demo_arthur_dent",
    ingredient_formula_name: "Sweetness Modulator",
    concentration: 8.0,
    unit: "g/kg",
    order_index: 10,
  },
  // Ford's formulas using bases
  {
    parent_formula_name: "Orange Sanguine Sicilienne",
    parent_owner: "demo_ford_prefect",
    ingredient_formula_name: "Citrus Zest Complex",
    concentration: 25.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Orange Sanguine Sicilienne",
    parent_owner: "demo_ford_prefect",
    ingredient_formula_name: "Red Berry Accord",
    concentration: 12.0,
    unit: "g/kg",
    order_index: 11,
  },
  {
    parent_formula_name: "Fraise Gariguette",
    parent_owner: "demo_ford_prefect",
    ingredient_formula_name: "Red Berry Accord",
    concentration: 45.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Fraise Gariguette",
    parent_owner: "demo_ford_prefect",
    ingredient_formula_name: "Sweetness Modulator",
    concentration: 10.0,
    unit: "g/kg",
    order_index: 11,
  },
  {
    parent_formula_name: "Citron de Menton",
    parent_owner: "demo_ford_prefect",
    ingredient_formula_name: "Citrus Zest Complex",
    concentration: 40.0,
    unit: "g/kg",
    order_index: 10,
  },
  // Trillian's formulas using bases
  {
    parent_formula_name: "Mangue Alphonso",
    parent_owner: "demo_trillian",
    ingredient_formula_name: "Tropical Fruit Complex",
    concentration: 50.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Mangue Alphonso",
    parent_owner: "demo_trillian",
    ingredient_formula_name: "Sweetness Modulator",
    concentration: 8.0,
    unit: "g/kg",
    order_index: 11,
  },
  {
    parent_formula_name: "Jasmin Sambac",
    parent_owner: "demo_trillian",
    ingredient_formula_name: "Floral Jasmine Accord",
    concentration: 60.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Fruit de la Passion",
    parent_owner: "demo_trillian",
    ingredient_formula_name: "Tropical Fruit Complex",
    concentration: 40.0,
    unit: "g/kg",
    order_index: 10,
  },
  {
    parent_formula_name: "Fruit de la Passion",
    parent_owner: "demo_trillian",
    ingredient_formula_name: "Citrus Zest Complex",
    concentration: 15.0,
    unit: "g/kg",
    order_index: 11,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function findSubstanceByName(name: string): Promise<number | null> {
  const result = await sql`
    SELECT substance_id FROM substance
    WHERE common_name ILIKE ${name}
    LIMIT 1
  `;
  return result.length > 0 ? (result[0].substance_id as number) : null;
}

async function getOrCreateCategory(name: string): Promise<number | null> {
  // Check if category exists
  const existing = await sql`
    SELECT category_id FROM category WHERE name = ${name}
  `;
  if (existing.length > 0) {
    return existing[0].category_id as number;
  }

  // Create category if not in dry run mode
  if (dryRun) {
    return null;
  }

  const result = await sql`
    INSERT INTO category (name)
    VALUES (${name})
    RETURNING category_id
  `;
  return result[0].category_id as number;
}

async function findFormulaByNameAndOwner(
  name: string,
  ownerId: string
): Promise<number | null> {
  const result = await sql`
    SELECT formula_id FROM formula
    WHERE name = ${name} AND user_id = ${ownerId}
    LIMIT 1
  `;
  return result.length > 0 ? (result[0].formula_id as number) : null;
}

async function createBaseFormula(formula: BaseFormula): Promise<number | null> {
  console.log(`  Creating base formula: ${formula.name}`);

  // Check if formula already exists
  const existingId = await findFormulaByNameAndOwner(
    formula.name,
    formula.owner_user_id
  );
  if (existingId) {
    console.log(`  ✓ Base formula already exists: ${formula.name}`);
    return existingId;
  }

  // Get or create category
  const categoryId = await getOrCreateCategory(formula.category_name);

  if (dryRun) {
    console.log(`  [DRY RUN] Would create base formula: ${formula.name}`);
    console.log(
      `  [DRY RUN] Would add ${formula.substances.length} substances`
    );
    return null;
  }

  // Create formula
  const result = await sql`
    INSERT INTO formula (
      name, description, is_public, user_id, category_id, status,
      version, base_unit, flavor_profile
    )
    VALUES (
      ${formula.name},
      ${formula.description},
      true,
      ${formula.owner_user_id},
      ${categoryId},
      'published',
      1,
      ${formula.base_unit},
      ${JSON.stringify(formula.flavor_profile)}
    )
    RETURNING formula_id
  `;
  const formulaId = result[0].formula_id as number;
  console.log(`  ✓ Created base formula: ${formula.name} (ID: ${formulaId})`);

  // Add substances
  let addedCount = 0;
  for (const sub of formula.substances) {
    const substanceId = await findSubstanceByName(sub.common_name);
    if (substanceId) {
      await sql`
        INSERT INTO substance_formula (
          substance_id, formula_id, concentration, unit, order_index, pyramid_position
        )
        VALUES (
          ${substanceId}, ${formulaId}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}, ${sub.pyramid_position ?? null}
        )
        ON CONFLICT (substance_id, formula_id) DO NOTHING
      `;
      addedCount++;
    } else {
      console.log(`  ⚠ Substance not found: ${sub.common_name}`);
    }
  }
  console.log(
    `  ✓ Added ${addedCount}/${formula.substances.length} substances`
  );

  return formulaId;
}

async function createCompoundLink(
  link: CompoundLink,
  baseFormulaIds: Map<string, number>
): Promise<boolean> {
  console.log(
    `  Linking "${link.ingredient_formula_name}" → "${link.parent_formula_name}"`
  );

  // Find parent formula
  const parentId = await findFormulaByNameAndOwner(
    link.parent_formula_name,
    link.parent_owner
  );
  if (!parentId) {
    console.log(
      `  ⚠ Parent formula not found: ${link.parent_formula_name} (owner: ${link.parent_owner})`
    );
    return false;
  }

  // Find ingredient formula (base formula)
  const ingredientId = baseFormulaIds.get(link.ingredient_formula_name);
  if (!ingredientId) {
    console.log(
      `  ⚠ Ingredient formula not found: ${link.ingredient_formula_name}`
    );
    return false;
  }

  if (dryRun) {
    console.log(
      `  [DRY RUN] Would link ingredient ${ingredientId} → parent ${parentId}`
    );
    return true;
  }

  // Check if link already exists
  const existing = await sql`
    SELECT 1 FROM ingredient_formula
    WHERE parent_formula_id = ${parentId}
    AND ingredient_formula_id = ${ingredientId}
  `;

  if (existing.length > 0) {
    console.log(`  ✓ Compound link already exists`);
    return true;
  }

  // Create the link
  await sql`
    INSERT INTO ingredient_formula (
      parent_formula_id, ingredient_formula_id, concentration, unit, order_index
    )
    VALUES (
      ${parentId}, ${ingredientId}, ${link.concentration}, ${link.unit}, ${link.order_index}
    )
  `;
  console.log(
    `  ✓ Created compound link: ${link.concentration} ${link.unit}`
  );

  return true;
}

async function cleanCompoundData(): Promise<void> {
  console.log("\n=== Cleaning compound data ===\n");

  if (dryRun) {
    console.log("[DRY RUN] Would delete all ingredient_formula links");
    console.log("[DRY RUN] Would delete base formulas owned by demo users");
    return;
  }

  // Delete all ingredient_formula links for demo users
  const deletedLinks = await sql`
    DELETE FROM ingredient_formula
    WHERE parent_formula_id IN (
      SELECT formula_id FROM formula
      WHERE user_id IN ('demo_arthur_dent', 'demo_ford_prefect', 'demo_trillian')
    )
    RETURNING parent_formula_id
  `;
  console.log(`✓ Deleted ${deletedLinks.length} compound links`);

  // Delete base formulas
  for (const base of BASE_FORMULAS) {
    const deleted = await sql`
      DELETE FROM formula
      WHERE name = ${base.name} AND user_id = ${base.owner_user_id}
      RETURNING formula_id
    `;
    if (deleted.length > 0) {
      console.log(`✓ Deleted base formula: ${base.name}`);
    }
  }

  console.log("\n✓ Compound data cleaned");
}

async function main(): Promise<void> {
  console.log("===========================================");
  console.log("  Seed Compound Formulas");
  console.log("===========================================\n");

  if (dryRun) {
    console.log("DRY RUN MODE - No changes will be made\n");
  }

  if (cleanMode) {
    await cleanCompoundData();
    return;
  }

  // Step 1: Create base formulas
  console.log("\n--- Creating Base Formulas ---\n");
  const baseFormulaIds = new Map<string, number>();

  for (const base of BASE_FORMULAS) {
    const formulaId = await createBaseFormula(base);
    if (formulaId) {
      baseFormulaIds.set(base.name, formulaId);
    }
  }

  console.log(`\n✓ Created ${baseFormulaIds.size} base formulas\n`);

  // Step 2: Create compound links
  console.log("\n--- Creating Compound Links ---\n");
  let successCount = 0;

  for (const link of COMPOUND_LINKS) {
    const success = await createCompoundLink(link, baseFormulaIds);
    if (success) {
      successCount++;
    }
  }

  console.log(
    `\n✓ Created ${successCount}/${COMPOUND_LINKS.length} compound links\n`
  );

  // Summary
  console.log("\n===========================================");
  console.log("  Summary");
  console.log("===========================================");
  console.log(`Base formulas created: ${baseFormulaIds.size}`);
  console.log(`Compound links created: ${successCount}`);
  console.log("\nDemo formulas now use nested compounds!");
  console.log("View them in the UI to see the compound functionality.\n");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
