/**
 * Seed demo users with professional profiles, flavours, and workspaces
 *
 * Creates:
 *   - Tricia McMillan (Senior Flavourist at Givaudan)
 *   - Random Dent (Independent Flavourist)
 *
 * Each user gets:
 *   - Complete profile (in French)
 *   - Professional flavour formulas
 *   - Workspaces shared with lmangall
 *
 * Usage:
 *   npx tsx scripts/seed-demo-users.ts
 *   npx tsx scripts/seed-demo-users.ts --dry-run
 *   npx tsx scripts/seed-demo-users.ts --clean
 *   npx tsx scripts/seed-demo-users.ts --lmangall-id=user_xxx
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
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
const lmangallIdArg = args.find((a) => a.startsWith("--lmangall-id="));

// =============================================================================
// DEMO USERS CONFIGURATION
// =============================================================================

const DEMO_USERS = [
  {
    user_id: "demo_tricia_mcmillan",
    email: "tricia.mcmillan@isipca.fr",
    name: "Tricia McMillan",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Tricia",
    profile: {
      bio: "Étudiante en 3ème année à l'ISIPCA, spécialisation arômes alimentaires. Passionnée par les accords vanillés et les profils laitiers. Stage de 6 mois chez Givaudan à Genève.",
      profile_type: "student",
      organization: "ISIPCA - École de Parfumerie et Arômes",
      job_title: "Étudiante en Aromatique",
      location: "Versailles, France",
      years_of_experience: "0-1",
      specializations: ["Vanille", "Produits laitiers", "Desserts", "Boissons"],
      certifications: ["HACCP Niveau 1"],
      field_of_study: "chemistry",
      professional_memberships: ["SFC"],
      is_profile_public: true,
      open_to_opportunities: true,
      onboarding_status: "completed",
    },
    social_links: [
      { platform: "linkedin", url: "https://linkedin.com/in/tricia-mcmillan", display_order: 1 },
      { platform: "instagram", url: "https://instagram.com/tricia_aromes", display_order: 2 },
    ],
  },
  {
    user_id: "demo_random_dent",
    email: "random.dent@univ-lyon1.fr",
    name: "Random Dent",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Random",
    profile: {
      bio: "Étudiant en Master 2 Sciences des Aliments à Lyon. Spécialisation en formulation d'arômes fruités. Projet de fin d'études sur les profils agrumes pour boissons artisanales.",
      profile_type: "student",
      organization: "Université Claude Bernard Lyon 1",
      job_title: "Étudiant Master Sciences des Aliments",
      location: "Lyon, France",
      years_of_experience: "0-1",
      specializations: ["Fruits", "Agrumes", "Confiserie", "Boissons gazeuses"],
      certifications: ["ISIPCA Summer School"],
      field_of_study: "food_science",
      professional_memberships: ["AFTAA"],
      is_profile_public: true,
      open_to_opportunities: true,
      onboarding_status: "completed",
    },
    social_links: [
      { platform: "linkedin", url: "https://linkedin.com/in/random-dent", display_order: 1 },
      { platform: "instagram", url: "https://instagram.com/random_flavours", display_order: 2 },
    ],
  },
];

// =============================================================================
// PROFESSIONAL FLAVOUR FORMULAS
// Concentrations in g/kg (parts per thousand)
// =============================================================================

interface SubstanceIngredient {
  common_name: string;
  concentration: number;
  unit: string;
  order_index: number;
}

interface FlavourFormula {
  name: string;
  description: string;
  base_unit: string;
  flavor_profile: string[];
  category_name: string;
  substances: SubstanceIngredient[];
}

const TRICIA_FLAVOURS: FlavourFormula[] = [
  {
    name: "Vanille Bourbon Madagascar",
    description: "Formule développée pendant mon stage chez Givaudan. Arôme vanille inspiré des gousses de Madagascar avec notes crémeuses et légèrement boisées. Validé par mon maître de stage.",
    base_unit: "g/kg",
    flavor_profile: ["Vanille", "Crémeux", "Boisé"],
    category_name: "Vanilla",
    substances: [
      { common_name: "Vanillin", concentration: 180.0, unit: "g/kg", order_index: 1 },
      { common_name: "Ethyl vanillin", concentration: 25.0, unit: "g/kg", order_index: 2 },
      { common_name: "Heliotropin", concentration: 8.0, unit: "g/kg", order_index: 3 },
      { common_name: "Anisyl alcohol", concentration: 5.0, unit: "g/kg", order_index: 4 },
      { common_name: "Maltol", concentration: 12.0, unit: "g/kg", order_index: 5 },
      { common_name: "Furaneol", concentration: 3.5, unit: "g/kg", order_index: 6 },
      { common_name: "Guaiacol", concentration: 0.8, unit: "g/kg", order_index: 7 },
      { common_name: "Acetoin", concentration: 4.0, unit: "g/kg", order_index: 8 },
    ],
  },
  {
    name: "Crème Fraîche Normande",
    description: "Projet de cours ISIPCA - Module arômes laitiers. Profil crémeux et lacté évoquant la crème fraîche de Normandie. Note obtenue: 17/20.",
    base_unit: "g/kg",
    flavor_profile: ["Lacté", "Crémeux", "Beurré"],
    category_name: "Dairy",
    substances: [
      { common_name: "Diacetyl", concentration: 45.0, unit: "g/kg", order_index: 1 },
      { common_name: "Acetoin", concentration: 35.0, unit: "g/kg", order_index: 2 },
      { common_name: "delta-Decalactone", concentration: 18.0, unit: "g/kg", order_index: 3 },
      { common_name: "delta-Dodecalactone", concentration: 8.0, unit: "g/kg", order_index: 4 },
      { common_name: "Butyric acid", concentration: 2.5, unit: "g/kg", order_index: 5 },
      { common_name: "Acetaldehyde", concentration: 1.2, unit: "g/kg", order_index: 6 },
    ],
  },
  {
    name: "Caramel au Beurre Salé",
    description: "Ma première création personnelle! Arôme caramel gourmand inspiré des caramels bretons. Testé avec succès sur un panel de 12 personnes au labo.",
    base_unit: "g/kg",
    flavor_profile: ["Caramel", "Beurré", "Sucré"],
    category_name: "Sweet",
    substances: [
      { common_name: "Furaneol", concentration: 85.0, unit: "g/kg", order_index: 1 },
      { common_name: "Maltol", concentration: 45.0, unit: "g/kg", order_index: 2 },
      { common_name: "Cyclotene", concentration: 25.0, unit: "g/kg", order_index: 3 },
      { common_name: "Diacetyl", concentration: 18.0, unit: "g/kg", order_index: 4 },
      { common_name: "Vanillin", concentration: 15.0, unit: "g/kg", order_index: 5 },
      { common_name: "Ethyl maltol", concentration: 8.0, unit: "g/kg", order_index: 6 },
      { common_name: "Acetoin", concentration: 6.0, unit: "g/kg", order_index: 7 },
    ],
  },
];

const RANDOM_FLAVOURS: FlavourFormula[] = [
  {
    name: "Orange Sanguine Sicilienne",
    description: "Formule développée pour mon mémoire de M2. Arôme d'orange sanguine intense avec des notes de framboise caractéristiques. Tests sensoriels réalisés avec 20 participants.",
    base_unit: "g/kg",
    flavor_profile: ["Agrume", "Fruité", "Zesté"],
    category_name: "Citrus",
    substances: [
      { common_name: "Limonene", concentration: 320.0, unit: "g/kg", order_index: 1 },
      { common_name: "Linalool", concentration: 45.0, unit: "g/kg", order_index: 2 },
      { common_name: "Octanal", concentration: 28.0, unit: "g/kg", order_index: 3 },
      { common_name: "Decanal", concentration: 18.0, unit: "g/kg", order_index: 4 },
      { common_name: "Citral", concentration: 12.0, unit: "g/kg", order_index: 5 },
      { common_name: "Ethyl butyrate", concentration: 8.0, unit: "g/kg", order_index: 6 },
      { common_name: "gamma-Terpinene", concentration: 15.0, unit: "g/kg", order_index: 7 },
    ],
  },
  {
    name: "Fraise Gariguette",
    description: "Projet TP Arômes fruités - Semestre 1. Arôme fraise inspiré de la variété Gariguette française. Formule optimisée après 3 itérations.",
    base_unit: "g/kg",
    flavor_profile: ["Fraise", "Fruité", "Sucré"],
    category_name: "Berry",
    substances: [
      { common_name: "Ethyl butyrate", concentration: 120.0, unit: "g/kg", order_index: 1 },
      { common_name: "Ethyl methylphenylglycidate", concentration: 85.0, unit: "g/kg", order_index: 2 },
      { common_name: "Furaneol", concentration: 45.0, unit: "g/kg", order_index: 3 },
      { common_name: "gamma-Decalactone", concentration: 25.0, unit: "g/kg", order_index: 4 },
      { common_name: "cis-3-Hexenol", concentration: 8.0, unit: "g/kg", order_index: 5 },
      { common_name: "Linalool", concentration: 6.0, unit: "g/kg", order_index: 6 },
      { common_name: "Maltol", concentration: 12.0, unit: "g/kg", order_index: 7 },
    ],
  },
  {
    name: "Citron de Menton",
    description: "Créé pour le partenariat avec la Brasserie du Vieux Lyon. Arôme citron frais et pétillant pour leur nouvelle limonade artisanale. Lancée été 2024!",
    base_unit: "g/kg",
    flavor_profile: ["Citron", "Frais", "Zesté"],
    category_name: "Citrus",
    substances: [
      { common_name: "Limonene", concentration: 280.0, unit: "g/kg", order_index: 1 },
      { common_name: "Citral", concentration: 95.0, unit: "g/kg", order_index: 2 },
      { common_name: "Linalool", concentration: 25.0, unit: "g/kg", order_index: 3 },
      { common_name: "Geraniol", concentration: 12.0, unit: "g/kg", order_index: 4 },
      { common_name: "Nonanal", concentration: 5.0, unit: "g/kg", order_index: 5 },
      { common_name: "Octanal", concentration: 8.0, unit: "g/kg", order_index: 6 },
    ],
  },
  {
    name: "Pêche de Vigne",
    description: "Exercice personnel - exploration des lactones. Arôme pêche juteux évoquant les pêches de vigne du sud de la France. En cours d'amélioration.",
    base_unit: "g/kg",
    flavor_profile: ["Pêche", "Fruité", "Juteux"],
    category_name: "Stone Fruit",
    substances: [
      { common_name: "gamma-Decalactone", concentration: 145.0, unit: "g/kg", order_index: 1 },
      { common_name: "delta-Decalactone", concentration: 55.0, unit: "g/kg", order_index: 2 },
      { common_name: "gamma-Undecalactone", concentration: 25.0, unit: "g/kg", order_index: 3 },
      { common_name: "Linalool", concentration: 18.0, unit: "g/kg", order_index: 4 },
      { common_name: "Benzaldehyde", concentration: 8.0, unit: "g/kg", order_index: 5 },
      { common_name: "cis-3-Hexenol", concentration: 4.0, unit: "g/kg", order_index: 6 },
    ],
  },
];

// =============================================================================
// WORKSPACES CONFIGURATION
// =============================================================================

interface WorkspaceConfig {
  name: string;
  description: string;
  created_by_user_id: string;
  flavour_names: string[]; // Names of flavours to add to workspace
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    name: "Projet de fin d'études - Vanille",
    description: "Projet ISIPCA 3ème année: développement d'une gamme vanille pour application desserts. Collaboration avec tuteur de stage pour validation des formules.",
    created_by_user_id: "demo_tricia_mcmillan",
    flavour_names: ["Vanille Bourbon Madagascar", "Caramel au Beurre Salé"],
  },
  {
    name: "Mémoire M2 - Agrumes Artisanaux",
    description: "Travail de mémoire Master 2: étude des profils agrumes pour limonades artisanales. Partenariat avec une brasserie locale lyonnaise.",
    created_by_user_id: "demo_random_dent",
    flavour_names: ["Orange Sanguine Sicilienne", "Citron de Menton"],
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function findLmangallUserId(): Promise<string | null> {
  // Try to find lmangall user by email pattern
  const results = await sql`
    SELECT user_id FROM users
    WHERE email ILIKE '%lmangall%'
       OR email ILIKE '%mangall%'
       OR username ILIKE '%lmangall%'
       OR username ILIKE '%mangall%'
    LIMIT 1
  `;

  if (results.length > 0) {
    return results[0].user_id as string;
  }

  // Try to find the most recent non-demo user
  const recentUser = await sql`
    SELECT user_id, email, username FROM users
    WHERE user_id NOT LIKE 'demo_%'
    ORDER BY created_at DESC
    LIMIT 5
  `;

  if (recentUser.length > 0) {
    console.log("\nCould not find lmangall user. Recent users found:");
    for (const u of recentUser) {
      console.log(`  - ${u.user_id} (${u.email || u.username})`);
    }
    console.log("\nUse --lmangall-id=<user_id> to specify which user to add to workspaces");
  }

  return null;
}

async function getOrCreateCategory(categoryName: string): Promise<number | null> {
  // Check if category exists
  const existing = await sql`
    SELECT category_id FROM category WHERE name = ${categoryName}
  `;

  if (existing.length > 0) {
    return existing[0].category_id as number;
  }

  // Create category if it doesn't exist
  if (!dryRun) {
    const created = await sql`
      INSERT INTO category (name, description)
      VALUES (${categoryName}, ${`Catégorie ${categoryName}`})
      RETURNING category_id
    `;
    return created[0].category_id as number;
  }

  return null;
}

async function findSubstanceByName(name: string): Promise<number | null> {
  const results = await sql`
    SELECT substance_id FROM substance
    WHERE common_name ILIKE ${name}
    LIMIT 1
  `;

  if (results.length > 0) {
    return results[0].substance_id as number;
  }

  // Try partial match
  const partial = await sql`
    SELECT substance_id, common_name FROM substance
    WHERE common_name ILIKE ${`%${name}%`}
    LIMIT 1
  `;

  if (partial.length > 0) {
    console.log(`  ℹ Matched "${name}" to "${partial[0].common_name}"`);
    return partial[0].substance_id as number;
  }

  return null;
}

// =============================================================================
// MAIN OPERATIONS
// =============================================================================

async function createUser(user: (typeof DEMO_USERS)[0]): Promise<void> {
  console.log(`\n--- Creating user: ${user.name} ---`);

  // Check if user exists
  const existing = await sql`
    SELECT user_id FROM users WHERE user_id = ${user.user_id}
  `;

  if (existing.length > 0) {
    console.log(`✓ User already exists: ${user.name}`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create user: ${user.name}`);
    console.log(`[DRY RUN] Would create profile with bio: ${user.profile.bio.substring(0, 50)}...`);
    return;
  }

  // Create user
  await sql`
    INSERT INTO users (user_id, email, username, image)
    VALUES (${user.user_id}, ${user.email}, ${user.name}, ${user.image})
  `;
  console.log(`✓ Created user: ${user.name}`);

  // Try to create profile (table may not exist)
  try {
    await sql`
      INSERT INTO user_profile (
        user_id, bio, profile_type, organization, job_title, location,
        years_of_experience, specializations, certifications, field_of_study,
        professional_memberships, is_profile_public, open_to_opportunities, onboarding_status
      )
      VALUES (
        ${user.user_id},
        ${user.profile.bio},
        ${user.profile.profile_type},
        ${user.profile.organization},
        ${user.profile.job_title},
        ${user.profile.location},
        ${user.profile.years_of_experience},
        ${user.profile.specializations},
        ${user.profile.certifications},
        ${user.profile.field_of_study},
        ${user.profile.professional_memberships},
        ${user.profile.is_profile_public},
        ${user.profile.open_to_opportunities},
        ${user.profile.onboarding_status}
      )
    `;
    console.log(`✓ Created profile for: ${user.name}`);

    // Create social links
    for (const link of user.social_links) {
      await sql`
        INSERT INTO user_social_link (user_id, platform, url, display_order)
        VALUES (${user.user_id}, ${link.platform}, ${link.url}, ${link.display_order})
      `;
    }
    console.log(`✓ Created ${user.social_links.length} social links for: ${user.name}`);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    if (errorMessage.includes("does not exist")) {
      console.log(`ℹ Skipping profile/social links (tables not migrated yet)`);
    } else {
      throw err;
    }
  }
}

async function createFlavour(
  userId: string,
  formula: FlavourFormula
): Promise<number | null> {
  console.log(`  Creating flavour: ${formula.name}`);

  // Check if flavour already exists for this user
  const existing = await sql`
    SELECT flavour_id FROM flavour
    WHERE user_id = ${userId} AND name = ${formula.name}
  `;

  if (existing.length > 0) {
    console.log(`  ✓ Flavour already exists: ${formula.name}`);
    return existing[0].flavour_id as number;
  }

  // Get or create category
  const categoryId = await getOrCreateCategory(formula.category_name);

  if (dryRun) {
    console.log(`  [DRY RUN] Would create flavour: ${formula.name}`);
    console.log(`  [DRY RUN] Would add ${formula.substances.length} substances`);
    return null;
  }

  // Create flavour
  const result = await sql`
    INSERT INTO flavour (
      name, description, is_public, user_id, category_id, status,
      version, base_unit, flavor_profile
    )
    VALUES (
      ${formula.name},
      ${formula.description},
      true,
      ${userId},
      ${categoryId},
      'published',
      1,
      ${formula.base_unit},
      ${JSON.stringify(formula.flavor_profile)}
    )
    RETURNING flavour_id
  `;
  const flavourId = result[0].flavour_id as number;
  console.log(`  ✓ Created flavour: ${formula.name} (ID: ${flavourId})`);

  // Add substances
  let addedCount = 0;
  for (const sub of formula.substances) {
    const substanceId = await findSubstanceByName(sub.common_name);
    if (substanceId) {
      await sql`
        INSERT INTO substance_flavour (
          substance_id, flavour_id, concentration, unit, order_index
        )
        VALUES (
          ${substanceId}, ${flavourId}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}
        )
        ON CONFLICT (substance_id, flavour_id) DO NOTHING
      `;
      addedCount++;
    } else {
      console.log(`  ⚠ Substance not found: ${sub.common_name}`);
    }
  }
  console.log(`  ✓ Added ${addedCount}/${formula.substances.length} substances`);

  return flavourId;
}

async function createWorkspace(
  config: WorkspaceConfig,
  lmangallId: string | null,
  flavourIdMap: Map<string, number>
): Promise<void> {
  console.log(`\n--- Creating workspace: ${config.name} ---`);

  // Check if workspace already exists
  const existing = await sql`
    SELECT workspace_id FROM workspace
    WHERE name = ${config.name} AND created_by = ${config.created_by_user_id}
  `;

  if (existing.length > 0) {
    console.log(`✓ Workspace already exists: ${config.name}`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create workspace: ${config.name}`);
    console.log(`[DRY RUN] Would add lmangall as editor`);
    console.log(`[DRY RUN] Would add ${config.flavour_names.length} flavours`);
    return;
  }

  // Create workspace
  const result = await sql`
    INSERT INTO workspace (name, description, created_by)
    VALUES (${config.name}, ${config.description}, ${config.created_by_user_id})
    RETURNING workspace_id
  `;
  const workspaceId = result[0].workspace_id as number;
  console.log(`✓ Created workspace: ${config.name} (ID: ${workspaceId})`);

  // Add creator as owner
  await sql`
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (${workspaceId}, ${config.created_by_user_id}, 'owner')
  `;
  console.log(`✓ Added owner: ${config.created_by_user_id}`);

  // Add lmangall as editor if found
  if (lmangallId) {
    await sql`
      INSERT INTO workspace_member (workspace_id, user_id, role)
      VALUES (${workspaceId}, ${lmangallId}, 'editor')
      ON CONFLICT (workspace_id, user_id) DO NOTHING
    `;
    console.log(`✓ Added lmangall as editor`);
  } else {
    console.log(`⚠ Could not add lmangall - user ID not found`);
  }

  // Add flavours to workspace
  for (const flavourName of config.flavour_names) {
    const flavourId = flavourIdMap.get(flavourName);
    if (flavourId) {
      await sql`
        INSERT INTO workspace_flavour (workspace_id, flavour_id, added_by)
        VALUES (${workspaceId}, ${flavourId}, ${config.created_by_user_id})
        ON CONFLICT (workspace_id, flavour_id) DO NOTHING
      `;
      console.log(`  ✓ Added flavour: ${flavourName}`);
    } else {
      console.log(`  ⚠ Flavour not found: ${flavourName}`);
    }
  }
}

async function cleanDemoData(): Promise<void> {
  console.log("\n=== Cleaning Demo Users Data ===\n");

  const userIds = DEMO_USERS.map((u) => u.user_id);

  if (dryRun) {
    console.log(`[DRY RUN] Would delete data for users: ${userIds.join(", ")}`);
    return;
  }

  // Delete workspaces (will cascade to members, flavours, documents)
  for (const userId of userIds) {
    const workspacesDeleted = await sql`
      DELETE FROM workspace WHERE created_by = ${userId}
      RETURNING workspace_id
    `;
    console.log(`✓ Deleted ${workspacesDeleted.length} workspaces for ${userId}`);

    // Delete flavours
    const flavoursDeleted = await sql`
      DELETE FROM flavour WHERE user_id = ${userId}
      RETURNING flavour_id
    `;
    console.log(`✓ Deleted ${flavoursDeleted.length} flavours for ${userId}`);

    // Delete profiles and social links (cascade from user delete)
    // Delete user
    await sql`
      DELETE FROM users WHERE user_id = ${userId}
    `;
    console.log(`✓ Deleted user: ${userId}`);
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  console.log("=== Demo Users Seed Script ===");
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  if (cleanMode) {
    await cleanDemoData();
    console.log("\n=== Done ===");
    return;
  }

  // Find lmangall user ID
  let lmangallId: string | null = null;
  if (lmangallIdArg) {
    lmangallId = lmangallIdArg.split("=")[1];
    console.log(`\nUsing provided lmangall ID: ${lmangallId}`);
  } else {
    lmangallId = await findLmangallUserId();
    if (lmangallId) {
      console.log(`\nFound lmangall user ID: ${lmangallId}`);
    }
  }

  // Track created flavour IDs for workspace assignment
  const flavourIdMap = new Map<string, number>();

  // Create users and their flavours
  for (const user of DEMO_USERS) {
    await createUser(user);

    console.log(`\nCreating flavours for ${user.name}...`);
    const formulas = user.user_id === "demo_tricia_mcmillan" ? TRICIA_FLAVOURS : RANDOM_FLAVOURS;

    for (const formula of formulas) {
      const flavourId = await createFlavour(user.user_id, formula);
      if (flavourId) {
        flavourIdMap.set(formula.name, flavourId);
      }
    }
  }

  // Create workspaces
  console.log("\n=== Creating Workspaces ===");
  for (const workspace of WORKSPACES) {
    await createWorkspace(workspace, lmangallId, flavourIdMap);
  }

  console.log("\n=== Done ===");

  if (!lmangallId) {
    console.log("\n⚠ Note: lmangall was not added to workspaces.");
    console.log("  Run again with --lmangall-id=<user_id> to add them.");
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
