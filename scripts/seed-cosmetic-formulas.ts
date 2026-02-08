/**
 * Seed cosmetic formulas for lmangall and demo users
 *
 * Creates professional-grade cosmetic formulas with:
 *   - Realistic concentrations (totaling ~100% w/w)
 *   - Proper phase assignments (water, oil, cool_down, surfactant, dry)
 *   - Manufacturing notes and target pH
 *   - Variation groups for A/B testing formulas
 *
 * Users & personas:
 *   - lmangall: Experienced formulator — O/W emulsions, serums, advanced actives
 *   - Arthur Dent: Hobbyist — simple balms, body butters, beginner-friendly
 *   - Ford Prefect: Student — cleansers, shampoos, surfactant-based products
 *   - Trillian: Student — serums, gels, active-focused skincare
 *
 * Usage:
 *   npx tsx scripts/seed-cosmetic-formulas.ts
 *   npx tsx scripts/seed-cosmetic-formulas.ts --dry-run
 *   npx tsx scripts/seed-cosmetic-formulas.ts --clean
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const cleanMode = args.includes("--clean");

// ============================================================================
// TYPES
// ============================================================================

interface SubstanceIngredient {
  /** Must match common_name in substance table */
  common_name: string;
  concentration: number;
  unit: string;
  order_index: number;
  phase: "water" | "oil" | "cool_down" | "surfactant" | "dry";
}

interface CosmeticFormula {
  name: string;
  description: string;
  base_unit: string;
  project_type: "cosmetic";
  cosmetic_product_type: string;
  target_ph: number | null;
  preservative_system: string | null;
  manufacturing_notes: string;
  substances: SubstanceIngredient[];
  /** Optional — used for variation groups */
  variation_group_name?: string;
  variation_label?: string;
  is_main_variation?: boolean;
}

// ============================================================================
// USER IDs
// ============================================================================

const LMANGALL_ID = "user_2wJI22ZkZOQPSb4Ang8vIAvcfMm";
const DEMO_USERS = {
  arthur: "demo_arthur_dent",
  ford: "demo_ford_prefect",
  trillian: "demo_trillian",
};

// ============================================================================
// LMANGALL FORMULAS — Experienced formulator
// ============================================================================

const LMANGALL_FORMULAS: CosmeticFormula[] = [
  // ── O/W Face Cream with Niacinamide ────────────────────────────
  {
    name: "Crème Visage Niacinamide 5%",
    description:
      "Émulsion O/W légère pour peaux mixtes. Niacinamide 5% pour affiner le grain de peau, acide hyaluronique pour l'hydratation. Texture fluide non grasse, absorption rapide.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "emulsion_ow",
    target_ph: 5.5,
    preservative_system: "Phenoxyethanol + Sodium Benzoate",
    manufacturing_notes:
      "Chauffer phases A et B séparément à 75 °C. Verser la phase B dans A sous agitation forte (hélice). Homogénéiser 3 min. Refroidir à 40 °C, ajouter phase C. Ajuster pH avec acide citrique. Contrôler viscosité à J+1.",
    variation_group_name: "Crème Niacinamide — Versions",
    variation_label: "A",
    is_main_variation: true,
    substances: [
      // Water phase (Phase A) — ~75%
      { common_name: "Water", concentration: 66.2, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 4.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Sodium Hyaluronate", concentration: 0.1, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Xanthan Gum", concentration: 0.3, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Oil phase (Phase B) — ~18%
      { common_name: "Cetearyl Olivate (and) Sorbitan Olivate", concentration: 5.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      { common_name: "Caprylic/Capric Triglyceride", concentration: 6.0, unit: "%(v/v)", order_index: 6, phase: "oil" },
      { common_name: "Jojoba Oil", concentration: 4.0, unit: "%(v/v)", order_index: 7, phase: "oil" },
      { common_name: "Cetyl Alcohol", concentration: 2.0, unit: "%(v/v)", order_index: 8, phase: "oil" },
      { common_name: "Tocopherol", concentration: 0.5, unit: "%(v/v)", order_index: 9, phase: "oil" },
      // Cool-down phase (Phase C) — ~7%
      { common_name: "Niacinamide", concentration: 5.0, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 2.0, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
      { common_name: "Sodium Benzoate", concentration: 0.3, unit: "%(v/v)", order_index: 13, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 14, phase: "cool_down" },
    ],
  },
  // Variation B — richer version with shea butter
  {
    name: "Crème Visage Niacinamide 5% — Riche",
    description:
      "Version riche de la crème niacinamide pour peaux sèches. Ajout de beurre de karité et d'huile d'argan pour une nutrition supplémentaire. Texture onctueuse, toucher velouté.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "emulsion_ow",
    target_ph: 5.5,
    preservative_system: "Phenoxyethanol + Sodium Benzoate",
    manufacturing_notes:
      "Même procédé que version A. Le beurre de karité doit être bien fondu avant émulsification. Agitation plus longue nécessaire (5 min) à cause de la viscosité accrue.",
    variation_group_name: "Crème Niacinamide — Versions",
    variation_label: "B",
    is_main_variation: false,
    substances: [
      { common_name: "Water", concentration: 60.1, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 5.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Sodium Hyaluronate", concentration: 0.1, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Xanthan Gum", concentration: 0.3, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Oil phase — heavier
      { common_name: "Cetearyl Olivate (and) Sorbitan Olivate", concentration: 5.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      { common_name: "Shea Butter", concentration: 4.0, unit: "%(v/v)", order_index: 6, phase: "oil" },
      { common_name: "Argan Oil", concentration: 3.0, unit: "%(v/v)", order_index: 7, phase: "oil" },
      { common_name: "Caprylic/Capric Triglyceride", concentration: 4.0, unit: "%(v/v)", order_index: 8, phase: "oil" },
      { common_name: "Cetyl Alcohol", concentration: 3.0, unit: "%(v/v)", order_index: 9, phase: "oil" },
      { common_name: "Tocopherol", concentration: 0.5, unit: "%(v/v)", order_index: 10, phase: "oil" },
      // Cool-down
      { common_name: "Niacinamide", concentration: 5.0, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 2.0, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
      { common_name: "Allantoin", concentration: 0.2, unit: "%(v/v)", order_index: 13, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 14, phase: "cool_down" },
      { common_name: "Sodium Benzoate", concentration: 0.3, unit: "%(v/v)", order_index: 15, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 16, phase: "cool_down" },
    ],
  },

  // ── Vitamin C Serum ────────────────────────────────────────────
  {
    name: "Sérum Vitamine C 15%",
    description:
      "Sérum aqueux à base d'acide ascorbique pur 15%. Formulé à pH 3.2 pour une pénétration optimale. Ajout de vitamine E comme antioxydant synergique. Conservation au frigo recommandée.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "gel",
    target_ph: 3.2,
    preservative_system: "Phenoxyethanol (le pH bas contribue aussi à la conservation)",
    manufacturing_notes:
      "Dissoudre le Carbomer dans l'eau, neutraliser partiellement avec NaOH (pH ~4.5). Ajouter l'acide ascorbique (pH chutera à ~3.2). Ajouter le reste sous agitation lente. NE PAS chauffer. Emballer en flacon opaque. DLC 3 mois.",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 73.25, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Propylene Glycol", concentration: 3.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Carbomer 940", concentration: 0.4, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Sodium Hydroxide", concentration: 0.15, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Cool-down (actives)
      { common_name: "Ascorbic Acid", concentration: 15.0, unit: "%(v/v)", order_index: 5, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 2.0, unit: "%(v/v)", order_index: 6, phase: "cool_down" },
      { common_name: "Sodium Hyaluronate", concentration: 0.1, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Tocopherol", concentration: 1.0, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Disodium EDTA", concentration: 0.1, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.2, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
    ],
  },

  // ── Nourishing Body Lotion ─────────────────────────────────────
  {
    name: "Lait Corporel Nourrissant",
    description:
      "Émulsion O/W corps légère et hydratante. Huile de coco fractionnée pour un fini non gras. Aloe vera et glycérine pour une hydratation longue durée. Parfum discret possible en phase C.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "emulsion_ow",
    target_ph: 5.8,
    preservative_system: "Dehydroacetic Acid (and) Benzyl Alcohol",
    manufacturing_notes:
      "Phase A à 70 °C. Phase B à 70 °C. Émulsifier B dans A sous Silverson 3000 rpm pendant 2 min. Refroidir sous agitation palme. Ajouter phase C à 38 °C. Ajuster pH. Vérifier viscosité Brookfield à J+7.",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 68.3, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 5.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Aloe Vera Gel", concentration: 2.0, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Xanthan Gum", concentration: 0.2, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Oil phase
      { common_name: "Glyceryl Stearate SE", concentration: 4.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      { common_name: "Caprylic/Capric Triglyceride", concentration: 8.0, unit: "%(v/v)", order_index: 6, phase: "oil" },
      { common_name: "Sweet Almond Oil", concentration: 3.0, unit: "%(v/v)", order_index: 7, phase: "oil" },
      { common_name: "Dimethicone", concentration: 1.5, unit: "%(v/v)", order_index: 8, phase: "oil" },
      { common_name: "Cetearyl Alcohol", concentration: 2.0, unit: "%(v/v)", order_index: 9, phase: "oil" },
      { common_name: "Stearic Acid", concentration: 1.5, unit: "%(v/v)", order_index: 10, phase: "oil" },
      { common_name: "Tocopherol", concentration: 0.3, unit: "%(v/v)", order_index: 11, phase: "oil" },
      // Cool-down
      { common_name: "Panthenol", concentration: 1.0, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
      { common_name: "Allantoin", concentration: 0.2, unit: "%(v/v)", order_index: 13, phase: "cool_down" },
      { common_name: "Dehydroacetic Acid (and) Benzyl Alcohol", concentration: 1.0, unit: "%(v/v)", order_index: 14, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 15, phase: "cool_down" },
    ],
  },
];

// ============================================================================
// ARTHUR DENT — Hobbyist, simple natural formulas
// ============================================================================

const ARTHUR_FORMULAS: CosmeticFormula[] = [
  // ── Lip Balm ───────────────────────────────────────────────────
  {
    name: "Baume à Lèvres Cire d'Abeille",
    description:
      "Mon premier baume à lèvres maison ! Recette simple et naturelle à base de cire d'abeille et beurre de karité. Texture protectrice, fond bien sur les lèvres.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "stick",
    target_ph: null,
    preservative_system: null,
    manufacturing_notes:
      "Faire fondre tous les ingrédients au bain-marie à 65 °C. Mélanger jusqu'à ce que tout soit homogène. Couler dans les tubes à lèvres. Laisser refroidir à température ambiante sans bouger. Anhydre = pas besoin de conservateur.",
    substances: [
      // Oil phase (stick = all oil)
      { common_name: "Beeswax absolute", concentration: 25.0, unit: "%(v/v)", order_index: 1, phase: "oil" },
      { common_name: "Shea Butter", concentration: 30.0, unit: "%(v/v)", order_index: 2, phase: "oil" },
      { common_name: "Coconut Oil Fractionated (Coconut MCT) Fixed Oil", concentration: 20.0, unit: "%(v/v)", order_index: 3, phase: "oil" },
      { common_name: "Sweet Almond Oil", concentration: 15.0, unit: "%(v/v)", order_index: 4, phase: "oil" },
      { common_name: "Castor Oil", concentration: 8.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      // Cool-down
      { common_name: "Tocopherol", concentration: 1.0, unit: "%(v/v)", order_index: 6, phase: "cool_down" },
    ],
  },

  // ── Body Butter ────────────────────────────────────────────────
  {
    name: "Beurre Corporel Karité-Coco",
    description:
      "Beurre corporel ultra-nourrissant pour l'hiver. Formule anhydre simple, parfaite pour les débutants. J'ai ajouté un peu de fécule pour réduire l'effet gras.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "anhydrous",
    target_ph: null,
    preservative_system: null,
    manufacturing_notes:
      "Fondre le beurre de karité et l'huile de coco au bain-marie (60 °C). Ajouter les huiles liquides. Laisser refroidir au frigo 30 min. Fouetter au batteur électrique jusqu'à obtenir une texture mousseuse. Ajouter la vitamine E. Conditionner en pot.",
    substances: [
      { common_name: "Shea Butter", concentration: 40.0, unit: "%(v/v)", order_index: 1, phase: "oil" },
      { common_name: "Coconut Oil Fractionated (Coconut MCT) Fixed Oil", concentration: 25.0, unit: "%(v/v)", order_index: 2, phase: "oil" },
      { common_name: "Jojoba Oil", concentration: 15.0, unit: "%(v/v)", order_index: 3, phase: "oil" },
      { common_name: "Avocado Oil", concentration: 10.0, unit: "%(v/v)", order_index: 4, phase: "oil" },
      { common_name: "Argan Oil", concentration: 5.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      // Cool-down
      { common_name: "Tocopherol", concentration: 1.0, unit: "%(v/v)", order_index: 6, phase: "cool_down" },
    ],
  },

  // ── Simple Moisturizer ─────────────────────────────────────────
  {
    name: "Crème Hydratante Débutant",
    description:
      "Ma première émulsion ! Recette basique trouvée sur Aroma-Zone et adaptée. Texture correcte, un peu granuleuse au début mais j'ai réussi à améliorer en chauffant mieux les phases.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "emulsion_ow",
    target_ph: 5.5,
    preservative_system: "Phenoxyethanol",
    manufacturing_notes:
      "Phase aqueuse à 75 °C. Phase huileuse à 75 °C. Verser l'huile dans l'eau EN MÉLANGEANT BIEN (j'ai raté la première fois en allant trop vite). Mixer 5 min. Attendre 40 °C pour la phase C. Tester le pH !",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 72.4, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 5.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      // Oil phase
      { common_name: "Glyceryl Stearate SE", concentration: 5.0, unit: "%(v/v)", order_index: 3, phase: "oil" },
      { common_name: "Sweet Almond Oil", concentration: 8.0, unit: "%(v/v)", order_index: 4, phase: "oil" },
      { common_name: "Cetyl Alcohol", concentration: 2.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      { common_name: "Shea Butter", concentration: 3.0, unit: "%(v/v)", order_index: 6, phase: "oil" },
      // Cool-down
      { common_name: "Aloe Vera Gel", concentration: 2.0, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.9, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Tocopherol", concentration: 0.5, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
    ],
  },
];

// ============================================================================
// FORD PREFECT — Student, surfactant-based & cleansing products
// ============================================================================

const FORD_FORMULAS: CosmeticFormula[] = [
  // ── Gentle Face Cleanser ───────────────────────────────────────
  {
    name: "Gel Nettoyant Doux Visage",
    description:
      "Projet TP Formulation cosmétique — Module tensioactifs. Nettoyant visage doux à base de glucosides. Système binaire coco-glucoside / bétaïne pour minimiser l'irritation. Note obtenue : 16/20.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "surfactant_based",
    target_ph: 5.2,
    preservative_system: "Sodium Benzoate + Potassium Sorbate",
    manufacturing_notes:
      "Dissoudre la gomme dans l'eau à 40 °C. Ajouter les tensioactifs UN PAR UN sous agitation lente (éviter la mousse!). Ajouter la glycérine. Phase C: actifs et conservateurs. Ajuster pH avec acide citrique. Viscosité finale ~3000 cP.",
    variation_group_name: "Nettoyant Visage — Variantes",
    variation_label: "Doux",
    is_main_variation: true,
    substances: [
      // Water phase
      { common_name: "Water", concentration: 66.05, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 3.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Xanthan Gum", concentration: 0.5, unit: "%(v/v)", order_index: 3, phase: "water" },
      // Surfactant phase
      { common_name: "Coco Glucoside", concentration: 12.0, unit: "%(v/v)", order_index: 4, phase: "surfactant" },
      { common_name: "Cocamidopropyl Betaine", concentration: 8.0, unit: "%(v/v)", order_index: 5, phase: "surfactant" },
      { common_name: "Decyl Glucoside", concentration: 4.0, unit: "%(v/v)", order_index: 6, phase: "surfactant" },
      // Cool-down
      { common_name: "Niacinamide", concentration: 2.0, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 1.0, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Aloe Vera Gel", concentration: 2.0, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Sodium Benzoate", concentration: 0.4, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Potassium Sorbate", concentration: 0.3, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.15, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
      { common_name: "Disodium EDTA", concentration: 0.1, unit: "%(v/v)", order_index: 13, phase: "cool_down" },
    ],
  },
  // Variation — stronger version
  {
    name: "Gel Nettoyant Visage — Purifiant",
    description:
      "Version plus nettoyante avec SLES pour peaux grasses. Ajout d'acide salicylique 0.5% comme actif anti-imperfections. Mousse plus dense que la version douce.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "surfactant_based",
    target_ph: 4.8,
    preservative_system: "Sodium Benzoate + Potassium Sorbate",
    manufacturing_notes:
      "Même procédé que version Douce. Le SLES mousse plus facilement : agiter TRÈS lentement. L'acide salicylique se dissout mieux dans la glycérine : pré-mélanger avant d'incorporer.",
    variation_group_name: "Nettoyant Visage — Variantes",
    variation_label: "Purifiant",
    is_main_variation: false,
    substances: [
      { common_name: "Water", concentration: 62.35, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 3.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Xanthan Gum", concentration: 0.5, unit: "%(v/v)", order_index: 3, phase: "water" },
      // Surfactant phase — stronger
      { common_name: "Sodium Laureth Sulfate", concentration: 8.0, unit: "%(v/v)", order_index: 4, phase: "surfactant" },
      { common_name: "Cocamidopropyl Betaine", concentration: 6.0, unit: "%(v/v)", order_index: 5, phase: "surfactant" },
      { common_name: "Coco Glucoside", concentration: 6.0, unit: "%(v/v)", order_index: 6, phase: "surfactant" },
      // Cool-down
      { common_name: "Salicylic Acid", concentration: 0.5, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Niacinamide", concentration: 2.0, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 0.5, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Aloe Vera Gel", concentration: 2.0, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Sodium Benzoate", concentration: 0.4, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Potassium Sorbate", concentration: 0.3, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.15, unit: "%(v/v)", order_index: 13, phase: "cool_down" },
      { common_name: "Disodium EDTA", concentration: 0.1, unit: "%(v/v)", order_index: 14, phase: "cool_down" },
    ],
  },

  // ── Moisturizing Shampoo ───────────────────────────────────────
  {
    name: "Shampooing Hydratant SCI",
    description:
      "Shampooing doux à base de SCI (Sodium Cocoyl Isethionate). Formulé pour cheveux secs et bouclés. La bétaïne adoucit la mousse. Glycérine et panthénol pour l'hydratation.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "surfactant_based",
    target_ph: 5.5,
    preservative_system: "Phenoxyethanol",
    manufacturing_notes:
      "Chauffer l'eau à 50 °C. Disperser le SCI sous agitation (il fond lentement). Ajouter la bétaïne, puis le glucoside. Ne pas trop chauffer le SCI (max 65 °C). Refroidir à 35 °C, ajouter phase C. Épaissir si nécessaire avec du sel (NaCl 0.5-2%).",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 60.2, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 2.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Hydroxyethylcellulose", concentration: 0.5, unit: "%(v/v)", order_index: 3, phase: "water" },
      // Surfactant phase
      { common_name: "Sodium Cocoyl Isethionate", concentration: 15.0, unit: "%(v/v)", order_index: 4, phase: "surfactant" },
      { common_name: "Cocamidopropyl Betaine", concentration: 8.0, unit: "%(v/v)", order_index: 5, phase: "surfactant" },
      { common_name: "Decyl Glucoside", concentration: 5.0, unit: "%(v/v)", order_index: 6, phase: "surfactant" },
      // Cool-down
      { common_name: "Panthenol", concentration: 2.0, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Jojoba Oil", concentration: 1.0, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.9, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.2, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Disodium EDTA", concentration: 0.1, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
    ],
  },
];

// ============================================================================
// TRILLIAN — Student, serums, gels, active-focused skincare
// ============================================================================

const TRILLIAN_FORMULAS: CosmeticFormula[] = [
  // ── Hyaluronic Acid Serum ──────────────────────────────────────
  {
    name: "Sérum Acide Hyaluronique Multi-Poids",
    description:
      "Projet de fin d'études — Sérum hydratant à base d'acide hyaluronique et glycérine. Texture aqueuse et absorption instantanée. Formulé pour être utilisé sous crème.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "gel",
    target_ph: 5.5,
    preservative_system: "Phenoxyethanol + Sodium Benzoate",
    manufacturing_notes:
      "Disperser le Carbomer dans l'eau sous agitation. Laisser gonfler 15 min. Ajouter la glycérine et le butylène glycol. Neutraliser avec NaOH (le gel se forme). Ajouter l'acide hyaluronique pré-hydraté. Phase C sous agitation lente. NE PAS CHAUFFER.",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 82.85, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 5.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Butylene Glycol", concentration: 3.0, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Carbomer 940", concentration: 0.3, unit: "%(v/v)", order_index: 4, phase: "water" },
      { common_name: "Sodium Hydroxide", concentration: 0.15, unit: "%(v/v)", order_index: 5, phase: "water" },
      // Cool-down
      { common_name: "Sodium Hyaluronate", concentration: 0.5, unit: "%(v/v)", order_index: 6, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 2.0, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Allantoin", concentration: 0.2, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Niacinamide", concentration: 4.0, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Sodium Benzoate", concentration: 0.3, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
    ],
  },

  // ── AHA Exfoliating Gel ────────────────────────────────────────
  {
    name: "Gel Exfoliant AHA 8%",
    description:
      "Gel exfoliant chimique combinant acide glycolique (6%) et acide lactique (2%). pH contrôlé à 3.8 pour une exfoliation efficace. Usage 2-3x/semaine maximum. Projet TP Actifs cosmétiques.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "gel",
    target_ph: 3.8,
    preservative_system: "Phenoxyethanol (pH bas aide à la conservation)",
    manufacturing_notes:
      "Disperser Carbomer dans l'eau. Ajouter glycérine. Neutraliser partiellement au NaOH (pH ~5). Ajouter les AHA EN DERNIER (le pH va chuter). Ajuster à pH 3.8 si nécessaire. ATTENTION : porter des gants, les AHA concentrés sont irritants.",
    substances: [
      // Water phase
      { common_name: "Water", concentration: 78.8, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 4.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Carbomer 940", concentration: 0.5, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Sodium Hydroxide", concentration: 0.2, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Cool-down
      { common_name: "Glycolic Acid", concentration: 6.0, unit: "%(v/v)", order_index: 5, phase: "cool_down" },
      { common_name: "Lactic Acid", concentration: 2.0, unit: "%(v/v)", order_index: 6, phase: "cool_down" },
      { common_name: "Allantoin", concentration: 0.3, unit: "%(v/v)", order_index: 7, phase: "cool_down" },
      { common_name: "Panthenol", concentration: 1.0, unit: "%(v/v)", order_index: 8, phase: "cool_down" },
      { common_name: "Sodium Hyaluronate", concentration: 0.1, unit: "%(v/v)", order_index: 9, phase: "cool_down" },
      { common_name: "Aloe Vera Gel", concentration: 3.0, unit: "%(v/v)", order_index: 10, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 11, phase: "cool_down" },
      { common_name: "Disodium EDTA", concentration: 0.1, unit: "%(v/v)", order_index: 12, phase: "cool_down" },
    ],
  },

  // ── W/O Rich Night Cream ───────────────────────────────────────
  {
    name: "Crème de Nuit Riche W/O",
    description:
      "Émulsion W/O pour peaux très sèches. Phase continue huileuse pour un effet occlusif et une réparation nocturne. Squalane et rétinol pour l'anti-âge. Texture riche mais non collante grâce au dimethicone crosspolymer.",
    base_unit: "%(v/v)",
    project_type: "cosmetic",
    cosmetic_product_type: "emulsion_wo",
    target_ph: 5.0,
    preservative_system: "Phenoxyethanol + Potassium Sorbate",
    manufacturing_notes:
      "Phase huileuse (continue) à 70 °C. Phase aqueuse à 70 °C. Ajouter l'eau DANS l'huile sous forte agitation. Homogénéiser 5 min. L'émulsion W/O est plus difficile : si ça casse, réchauffer et ré-homogénéiser. Phase C à 35 °C max (rétinol sensible).",
    substances: [
      // Water phase (inner phase of W/O)
      { common_name: "Water", concentration: 42.1, unit: "%(v/v)", order_index: 1, phase: "water" },
      { common_name: "Glycerin", concentration: 5.0, unit: "%(v/v)", order_index: 2, phase: "water" },
      { common_name: "Butylene Glycol", concentration: 3.0, unit: "%(v/v)", order_index: 3, phase: "water" },
      { common_name: "Sodium Hyaluronate", concentration: 0.1, unit: "%(v/v)", order_index: 4, phase: "water" },
      // Oil phase (continuous phase)
      { common_name: "Squalane", concentration: 12.0, unit: "%(v/v)", order_index: 5, phase: "oil" },
      { common_name: "Caprylic/Capric Triglyceride", concentration: 8.0, unit: "%(v/v)", order_index: 6, phase: "oil" },
      { common_name: "Cetyl Dimethicone", concentration: 4.0, unit: "%(v/v)", order_index: 7, phase: "oil" },
      { common_name: "Sorbitan Oleate", concentration: 3.5, unit: "%(v/v)", order_index: 8, phase: "oil" },
      { common_name: "Rosehip Seed Oil", concentration: 3.0, unit: "%(v/v)", order_index: 9, phase: "oil" },
      { common_name: "Shea Butter", concentration: 5.0, unit: "%(v/v)", order_index: 10, phase: "oil" },
      { common_name: "Dimethicone Crosspolymer", concentration: 2.0, unit: "%(v/v)", order_index: 11, phase: "oil" },
      { common_name: "Beeswax absolute", concentration: 2.0, unit: "%(v/v)", order_index: 12, phase: "oil" },
      { common_name: "Tocopherol", concentration: 0.5, unit: "%(v/v)", order_index: 13, phase: "oil" },
      // Cool-down
      { common_name: "Retinol", concentration: 0.3, unit: "%(v/v)", order_index: 14, phase: "cool_down" },
      { common_name: "Niacinamide", concentration: 3.0, unit: "%(v/v)", order_index: 15, phase: "cool_down" },
      { common_name: "Phenoxyethanol", concentration: 0.8, unit: "%(v/v)", order_index: 16, phase: "cool_down" },
      { common_name: "Potassium Sorbate", concentration: 0.3, unit: "%(v/v)", order_index: 17, phase: "cool_down" },
      { common_name: "Citric Acid", concentration: 0.1, unit: "%(v/v)", order_index: 18, phase: "cool_down" },
    ],
  },
];

// ============================================================================
// DB HELPERS
// ============================================================================

async function findSubstanceByName(name: string): Promise<number | null> {
  // Try exact match first
  let results = await sql`
    SELECT substance_id FROM substance
    WHERE common_name ILIKE ${name}
    LIMIT 1
  `;
  if (results.length > 0) return results[0].substance_id as number;

  // Try INCI name
  results = await sql`
    SELECT substance_id FROM substance
    WHERE inci_name ILIKE ${name}
    LIMIT 1
  `;
  if (results.length > 0) return results[0].substance_id as number;

  // Try partial match (e.g. "Beeswax" matches "Beeswax absolute")
  results = await sql`
    SELECT substance_id FROM substance
    WHERE common_name ILIKE ${name + "%"}
    LIMIT 1
  `;
  if (results.length > 0) return results[0].substance_id as number;

  // Try INCI partial
  results = await sql`
    SELECT substance_id FROM substance
    WHERE inci_name ILIKE ${name + "%"}
    LIMIT 1
  `;
  if (results.length > 0) return results[0].substance_id as number;

  return null;
}

async function getOrCreateCategory(name: string): Promise<number | null> {
  const existing = await sql`
    SELECT category_id FROM category WHERE name ILIKE ${name} LIMIT 1
  `;
  if (existing.length > 0) return existing[0].category_id as number;

  // Create a "Cosmetic" category
  const created = await sql`
    INSERT INTO category (name, description)
    VALUES (${name}, ${"Cosmetic formula category"})
    RETURNING category_id
  `;
  return created[0].category_id as number;
}

async function getOrCreateVariationGroup(
  name: string,
  userId: string
): Promise<number> {
  const existing = await sql`
    SELECT group_id FROM variation_group
    WHERE name = ${name} AND user_id = ${userId}
    LIMIT 1
  `;
  if (existing.length > 0) return existing[0].group_id as number;

  const created = await sql`
    INSERT INTO variation_group (name, user_id)
    VALUES (${name}, ${userId})
    RETURNING group_id
  `;
  return created[0].group_id as number;
}

// ============================================================================
// MAIN INSERT LOGIC
// ============================================================================

async function createFormula(
  formula: CosmeticFormula,
  userId: string
): Promise<number | null> {
  const categoryId = await getOrCreateCategory("Cosmetic");

  if (dryRun) {
    console.log(`  [DRY RUN] Would create: ${formula.name}`);
    console.log(
      `  [DRY RUN]   ${formula.substances.length} substances, type=${formula.cosmetic_product_type}, pH=${formula.target_ph ?? "N/A"}`
    );
    const total = formula.substances.reduce((s, i) => s + i.concentration, 0);
    console.log(`  [DRY RUN]   Total concentration: ${total.toFixed(2)}%`);
    return null;
  }

  // Handle variation groups
  let variationGroupId: number | null = null;
  if (formula.variation_group_name) {
    variationGroupId = await getOrCreateVariationGroup(
      formula.variation_group_name,
      userId
    );
  }

  // Insert formula
  const result = await sql`
    INSERT INTO formula (
      name, description, is_public, user_id, category_id, status,
      version, base_unit, project_type, cosmetic_product_type,
      target_ph, preservative_system, manufacturing_notes,
      variation_group_id, variation_label, is_main_variation
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
      ${formula.project_type},
      ${formula.cosmetic_product_type},
      ${formula.target_ph},
      ${formula.preservative_system},
      ${formula.manufacturing_notes},
      ${variationGroupId},
      ${formula.variation_label ?? null},
      ${formula.is_main_variation ?? false}
    )
    RETURNING formula_id
  `;
  const formulaId = result[0].formula_id as number;
  console.log(`  ✓ Created formula: ${formula.name} (ID: ${formulaId})`);

  // Add substances with phase assignments
  let addedCount = 0;
  let missingCount = 0;
  for (const sub of formula.substances) {
    const substanceId = await findSubstanceByName(sub.common_name);
    if (substanceId) {
      await sql`
        INSERT INTO substance_formula (
          substance_id, formula_id, concentration, unit, order_index, phase
        )
        VALUES (
          ${substanceId}, ${formulaId}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}, ${sub.phase}
        )
        ON CONFLICT (substance_id, formula_id) DO NOTHING
      `;
      addedCount++;
    } else {
      console.log(`    ⚠ Substance not found: "${sub.common_name}"`);
      missingCount++;
    }
  }
  console.log(
    `    → ${addedCount}/${formula.substances.length} substances added${missingCount > 0 ? ` (${missingCount} missing)` : ""}`
  );

  return formulaId;
}

// ============================================================================
// CLEAN
// ============================================================================

async function cleanCosmeticFormulas() {
  console.log("\n🧹 Cleaning cosmetic formulas...\n");

  const allUserIds = [LMANGALL_ID, ...Object.values(DEMO_USERS)];

  for (const userId of allUserIds) {
    const deleted = await sql`
      DELETE FROM formula
      WHERE user_id = ${userId}
        AND project_type = 'cosmetic'
      RETURNING formula_id, name
    `;
    if (deleted.length > 0) {
      console.log(`  ✓ Deleted ${deleted.length} cosmetic formulas for ${userId}`);
      for (const f of deleted) {
        console.log(`    - ${f.name} (ID: ${f.formula_id})`);
      }
    }
  }

  // Clean empty variation groups
  const orphanGroups = await sql`
    DELETE FROM variation_group
    WHERE group_id NOT IN (
      SELECT DISTINCT variation_group_id FROM formula WHERE variation_group_id IS NOT NULL
    )
    RETURNING group_id, name
  `;
  if (orphanGroups.length > 0) {
    console.log(`  ✓ Cleaned ${orphanGroups.length} orphan variation groups`);
  }

  console.log("\n✅ Clean complete.\n");
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🧴 Cosmetic Formulas Seeder");
  console.log("============================\n");

  if (dryRun) console.log("🔍 DRY RUN MODE — no changes will be made\n");
  if (cleanMode) {
    await cleanCosmeticFormulas();
    if (!args.includes("--seed-after-clean")) return;
  }

  // Check for existing cosmetic formulas
  const existing = await sql`
    SELECT COUNT(*) as count FROM formula WHERE project_type = 'cosmetic'
  `;
  const existingCount = Number(existing[0].count);
  if (existingCount > 0 && !cleanMode) {
    console.log(
      `⚠ Found ${existingCount} existing cosmetic formulas. Use --clean to remove them first, or they will be added alongside.\n`
    );
  }

  // Verify substances are seeded
  const substanceCheck = await sql`
    SELECT COUNT(*) as count FROM substance
    WHERE domain IN ('cosmetic', 'both')
  `;
  const substanceCount = Number(substanceCheck[0].count);
  console.log(`📦 Found ${substanceCount} cosmetic substances in database.\n`);
  if (substanceCount < 30) {
    console.error(
      "❌ Not enough cosmetic substances. Run seed-cosmetic-substances.ts first."
    );
    process.exit(1);
  }

  // ── Seed lmangall ──
  console.log(`\n👤 lmangall (${LMANGALL_ID})`);
  console.log("─".repeat(50));
  for (const formula of LMANGALL_FORMULAS) {
    await createFormula(formula, LMANGALL_ID);
  }

  // ── Seed Arthur Dent ──
  console.log(`\n👤 Arthur Dent (${DEMO_USERS.arthur})`);
  console.log("─".repeat(50));
  for (const formula of ARTHUR_FORMULAS) {
    await createFormula(formula, DEMO_USERS.arthur);
  }

  // ── Seed Ford Prefect ──
  console.log(`\n👤 Ford Prefect (${DEMO_USERS.ford})`);
  console.log("─".repeat(50));
  for (const formula of FORD_FORMULAS) {
    await createFormula(formula, DEMO_USERS.ford);
  }

  // ── Seed Trillian ──
  console.log(`\n👤 Trillian (${DEMO_USERS.trillian})`);
  console.log("─".repeat(50));
  for (const formula of TRILLIAN_FORMULAS) {
    await createFormula(formula, DEMO_USERS.trillian);
  }

  // ── Summary ──
  const totalFormulas =
    LMANGALL_FORMULAS.length +
    ARTHUR_FORMULAS.length +
    FORD_FORMULAS.length +
    TRILLIAN_FORMULAS.length;

  console.log("\n" + "═".repeat(50));
  console.log(`\n✅ Done! ${dryRun ? "Would create" : "Created"} ${totalFormulas} cosmetic formulas:`);
  console.log(`   • lmangall: ${LMANGALL_FORMULAS.length} (O/W cream variants, Vit C serum, body lotion)`);
  console.log(`   • Arthur Dent: ${ARTHUR_FORMULAS.length} (lip balm, body butter, simple cream)`);
  console.log(`   • Ford Prefect: ${FORD_FORMULAS.length} (face cleanser variants, shampoo)`);
  console.log(`   • Trillian: ${TRILLIAN_FORMULAS.length} (HA serum, AHA gel, W/O night cream)`);
  console.log(`   • Variation groups: 2 (Niacinamide cream A/B, Cleanser Doux/Purifiant)`);
  console.log("");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
