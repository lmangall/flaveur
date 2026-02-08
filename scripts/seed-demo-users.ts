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
// Uses the same user IDs as constants/samples.ts for impersonation compatibility
// =============================================================================

const DEMO_USERS = [
  {
    user_id: "demo_arthur_dent",
    email: "arthur.dent@example.com",
    name: "Arthur Dent",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Arthur",
    profile: {
      bio: "Flavoriste amateur passionné depuis 3 ans. Spécialisé dans les profils vanille et desserts gourmands. J'aime expérimenter avec les lactones et les notes caramel.",
      profile_type: "hobbyist",
      organization: null,
      job_title: "Flavoriste Amateur",
      location: "Londres, UK",
      years_of_experience: "2-5",
      specializations: ["Vanille", "Desserts", "Caramel", "Produits laitiers"],
      certifications: [],
      field_of_study: "other",
      professional_memberships: [],
      is_profile_public: true,
      open_to_opportunities: false,
      onboarding_status: "completed",
    },
    social_links: [
      { platform: "website", url: "https://arthurdent.blog", display_order: 1 },
    ],
  },
  {
    user_id: "demo_ford_prefect",
    email: "ford.prefect@example.com",
    name: "Ford Prefect",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Ford",
    profile: {
      bio: "Étudiant en Master 2 Sciences des Aliments à Lyon. Spécialisation en formulation d'arômes fruités et agrumes. Projet de fin d'études sur les profils méditerranéens.",
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
      { platform: "linkedin", url: "https://linkedin.com/in/ford-prefect", display_order: 1 },
      { platform: "instagram", url: "https://instagram.com/ford_flavours", display_order: 2 },
    ],
  },
  {
    user_id: "demo_trillian",
    email: "trillian@example.com",
    name: "Trillian",
    image: "https://api.dicebear.com/7.x/personas/svg?seed=Trillian",
    profile: {
      bio: "Étudiante en 3ème année à l'ISIPCA, spécialisation arômes alimentaires. Passionnée par les accords floraux et les profils exotiques. Stage de 6 mois chez Givaudan à Genève.",
      profile_type: "student",
      organization: "ISIPCA - École de Parfumerie et Arômes",
      job_title: "Étudiante en Aromatique",
      location: "Versailles, France",
      years_of_experience: "0-1",
      specializations: ["Floral", "Exotique", "Tropical", "Boissons"],
      certifications: ["HACCP Niveau 1"],
      field_of_study: "chemistry",
      professional_memberships: ["SFC"],
      is_profile_public: true,
      open_to_opportunities: true,
      onboarding_status: "completed",
    },
    social_links: [
      { platform: "linkedin", url: "https://linkedin.com/in/trillian", display_order: 1 },
      { platform: "instagram", url: "https://instagram.com/trillian_aromes", display_order: 2 },
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
  pyramid_position?: "top" | "heart" | "base";
}

interface FlavorProfileAttribute {
  attribute: string;
  value: number;
}

interface FlavourFormula {
  name: string;
  description: string;
  base_unit: string;
  flavor_profile: FlavorProfileAttribute[];
  category_name: string;
  substances: SubstanceIngredient[];
}

const ARTHUR_FLAVOURS: FlavourFormula[] = [
  {
    name: "Vanille Bourbon Madagascar",
    description: "Formule développée pendant mon stage chez Givaudan. Arôme vanille inspiré des gousses de Madagascar avec notes crémeuses et légèrement boisées. Validé par mon maître de stage.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 75 },
      { attribute: "Sourness", value: 5 },
      { attribute: "Bitterness", value: 10 },
      { attribute: "Umami", value: 15 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Vanilla",
    substances: [
      { common_name: "Vanillin", concentration: 180.0, unit: "g/kg", order_index: 1, pyramid_position: "heart" },
      { common_name: "Ethyl vanillin", concentration: 25.0, unit: "g/kg", order_index: 2, pyramid_position: "heart" },
      { common_name: "Heliotropin", concentration: 8.0, unit: "g/kg", order_index: 3, pyramid_position: "heart" },
      { common_name: "Anisyl alcohol", concentration: 5.0, unit: "g/kg", order_index: 4, pyramid_position: "heart" },
      { common_name: "Maltol", concentration: 12.0, unit: "g/kg", order_index: 5, pyramid_position: "base" },
      { common_name: "Furaneol", concentration: 3.5, unit: "g/kg", order_index: 6, pyramid_position: "heart" },
      { common_name: "Guaiacol", concentration: 0.8, unit: "g/kg", order_index: 7, pyramid_position: "base" },
      { common_name: "Acetoin", concentration: 4.0, unit: "g/kg", order_index: 8, pyramid_position: "heart" },
    ],
  },
  {
    name: "Crème Fraîche Normande",
    description: "Projet de cours ISIPCA - Module arômes laitiers. Profil crémeux et lacté évoquant la crème fraîche de Normandie. Note obtenue: 17/20.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 30 },
      { attribute: "Sourness", value: 25 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 40 },
      { attribute: "Saltiness", value: 20 },
    ],
    category_name: "Dairy",
    substances: [
      { common_name: "Diacetyl", concentration: 45.0, unit: "g/kg", order_index: 1, pyramid_position: "top" },
      { common_name: "Acetoin", concentration: 35.0, unit: "g/kg", order_index: 2, pyramid_position: "heart" },
      { common_name: "delta-Decalactone", concentration: 18.0, unit: "g/kg", order_index: 3, pyramid_position: "base" },
      { common_name: "delta-Dodecalactone", concentration: 8.0, unit: "g/kg", order_index: 4, pyramid_position: "base" },
      { common_name: "Butyric acid", concentration: 2.5, unit: "g/kg", order_index: 5, pyramid_position: "heart" },
      { common_name: "Acetaldehyde", concentration: 1.2, unit: "g/kg", order_index: 6, pyramid_position: "top" },
    ],
  },
  {
    name: "Caramel au Beurre Salé",
    description: "Ma première création personnelle! Arôme caramel gourmand inspiré des caramels bretons. Testé avec succès sur un panel de 12 personnes au labo.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 85 },
      { attribute: "Sourness", value: 5 },
      { attribute: "Bitterness", value: 15 },
      { attribute: "Umami", value: 10 },
      { attribute: "Saltiness", value: 45 },
    ],
    category_name: "Sweet",
    substances: [
      { common_name: "Furaneol", concentration: 85.0, unit: "g/kg", order_index: 1, pyramid_position: "heart" },
      { common_name: "Maltol", concentration: 45.0, unit: "g/kg", order_index: 2, pyramid_position: "base" },
      { common_name: "Cyclotene", concentration: 25.0, unit: "g/kg", order_index: 3, pyramid_position: "base" },
      { common_name: "Diacetyl", concentration: 18.0, unit: "g/kg", order_index: 4, pyramid_position: "top" },
      { common_name: "Vanillin", concentration: 15.0, unit: "g/kg", order_index: 5, pyramid_position: "heart" },
      { common_name: "Ethyl maltol", concentration: 8.0, unit: "g/kg", order_index: 6, pyramid_position: "base" },
      { common_name: "Acetoin", concentration: 6.0, unit: "g/kg", order_index: 7, pyramid_position: "heart" },
    ],
  },
];

const FORD_FLAVOURS: FlavourFormula[] = [
  {
    name: "Orange Sanguine Sicilienne",
    description: "Formule développée pour mon mémoire de M2. Arôme d'orange sanguine intense avec des notes de framboise caractéristiques. Tests sensoriels réalisés avec 20 participants.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 55 },
      { attribute: "Sourness", value: 60 },
      { attribute: "Bitterness", value: 25 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Citrus",
    substances: [
      { common_name: "Limonene", concentration: 320.0, unit: "g/kg", order_index: 1, pyramid_position: "top" },
      { common_name: "Linalool", concentration: 45.0, unit: "g/kg", order_index: 2, pyramid_position: "heart" },
      { common_name: "Octanal", concentration: 28.0, unit: "g/kg", order_index: 3, pyramid_position: "top" },
      { common_name: "Decanal", concentration: 18.0, unit: "g/kg", order_index: 4, pyramid_position: "top" },
      { common_name: "Citral", concentration: 12.0, unit: "g/kg", order_index: 5, pyramid_position: "top" },
      { common_name: "Ethyl butyrate", concentration: 8.0, unit: "g/kg", order_index: 6, pyramid_position: "top" },
      { common_name: "gamma-Terpinene", concentration: 15.0, unit: "g/kg", order_index: 7, pyramid_position: "top" },
    ],
  },
  {
    name: "Fraise Gariguette",
    description: "Projet TP Arômes fruités - Semestre 1. Arôme fraise inspiré de la variété Gariguette française. Formule optimisée après 3 itérations.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 70 },
      { attribute: "Sourness", value: 35 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Berry",
    substances: [
      { common_name: "Ethyl butyrate", concentration: 120.0, unit: "g/kg", order_index: 1, pyramid_position: "top" },
      { common_name: "Ethyl methylphenylglycidate", concentration: 85.0, unit: "g/kg", order_index: 2, pyramid_position: "heart" },
      { common_name: "Furaneol", concentration: 45.0, unit: "g/kg", order_index: 3, pyramid_position: "heart" },
      { common_name: "gamma-Decalactone", concentration: 25.0, unit: "g/kg", order_index: 4, pyramid_position: "base" },
      { common_name: "cis-3-Hexenol", concentration: 8.0, unit: "g/kg", order_index: 5, pyramid_position: "top" },
      { common_name: "Linalool", concentration: 6.0, unit: "g/kg", order_index: 6, pyramid_position: "heart" },
      { common_name: "Maltol", concentration: 12.0, unit: "g/kg", order_index: 7, pyramid_position: "base" },
    ],
  },
  {
    name: "Citron de Menton",
    description: "Créé pour le partenariat avec la Brasserie du Vieux Lyon. Arôme citron frais et pétillant pour leur nouvelle limonade artisanale. Lancée été 2024!",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 25 },
      { attribute: "Sourness", value: 80 },
      { attribute: "Bitterness", value: 20 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 10 },
    ],
    category_name: "Citrus",
    substances: [
      { common_name: "Limonene", concentration: 280.0, unit: "g/kg", order_index: 1, pyramid_position: "top" },
      { common_name: "Citral", concentration: 95.0, unit: "g/kg", order_index: 2, pyramid_position: "top" },
      { common_name: "Linalool", concentration: 25.0, unit: "g/kg", order_index: 3, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 12.0, unit: "g/kg", order_index: 4, pyramid_position: "heart" },
      { common_name: "Nonanal", concentration: 5.0, unit: "g/kg", order_index: 5, pyramid_position: "top" },
      { common_name: "Octanal", concentration: 8.0, unit: "g/kg", order_index: 6, pyramid_position: "top" },
    ],
  },
  {
    name: "Pêche de Vigne",
    description: "Exercice personnel - exploration des lactones. Arôme pêche juteux évoquant les pêches de vigne du sud de la France. En cours d'amélioration.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 65 },
      { attribute: "Sourness", value: 30 },
      { attribute: "Bitterness", value: 10 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Stone Fruit",
    substances: [
      { common_name: "gamma-Decalactone", concentration: 145.0, unit: "g/kg", order_index: 1, pyramid_position: "heart" },
      { common_name: "delta-Decalactone", concentration: 55.0, unit: "g/kg", order_index: 2, pyramid_position: "base" },
      { common_name: "gamma-Undecalactone", concentration: 25.0, unit: "g/kg", order_index: 3, pyramid_position: "base" },
      { common_name: "Linalool", concentration: 18.0, unit: "g/kg", order_index: 4, pyramid_position: "heart" },
      { common_name: "Benzaldehyde", concentration: 8.0, unit: "g/kg", order_index: 5, pyramid_position: "top" },
      { common_name: "cis-3-Hexenol", concentration: 4.0, unit: "g/kg", order_index: 6, pyramid_position: "top" },
    ],
  },
];

const TRILLIAN_FLAVOURS: FlavourFormula[] = [
  {
    name: "Mangue Alphonso",
    description: "Projet de stage chez Givaudan - profil mangue tropicale inspiré de la variété indienne Alphonso. Notes crémeuses et florales caractéristiques.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 75 },
      { attribute: "Sourness", value: 25 },
      { attribute: "Bitterness", value: 5 },
      { attribute: "Umami", value: 10 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Tropical",
    substances: [
      { common_name: "gamma-Octalactone", concentration: 85.0, unit: "g/kg", order_index: 1, pyramid_position: "heart" },
      { common_name: "delta-Decalactone", concentration: 45.0, unit: "g/kg", order_index: 2, pyramid_position: "base" },
      { common_name: "Linalool", concentration: 25.0, unit: "g/kg", order_index: 3, pyramid_position: "heart" },
      { common_name: "Ethyl butyrate", concentration: 18.0, unit: "g/kg", order_index: 4, pyramid_position: "top" },
      { common_name: "Geraniol", concentration: 8.0, unit: "g/kg", order_index: 5, pyramid_position: "heart" },
      { common_name: "cis-3-Hexenol", concentration: 3.0, unit: "g/kg", order_index: 6, pyramid_position: "top" },
    ],
  },
  {
    name: "Jasmin Sambac",
    description: "Exploration des notes florales pour applications boissons. Profil jasmin délicat avec facettes fruitées et légèrement indoliques.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 40 },
      { attribute: "Sourness", value: 10 },
      { attribute: "Bitterness", value: 15 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Floral",
    substances: [
      { common_name: "Linalool", concentration: 120.0, unit: "g/kg", order_index: 1, pyramid_position: "heart" },
      { common_name: "Benzyl acetate", concentration: 65.0, unit: "g/kg", order_index: 2, pyramid_position: "heart" },
      { common_name: "Indole", concentration: 2.0, unit: "g/kg", order_index: 3, pyramid_position: "base" },
      { common_name: "Methyl anthranilate", concentration: 8.0, unit: "g/kg", order_index: 4, pyramid_position: "heart" },
      { common_name: "Geraniol", concentration: 15.0, unit: "g/kg", order_index: 5, pyramid_position: "heart" },
      { common_name: "Phenylethyl alcohol", concentration: 25.0, unit: "g/kg", order_index: 6, pyramid_position: "heart" },
    ],
  },
  {
    name: "Fruit de la Passion",
    description: "Formule développée pour un projet de cocktail sans alcool. Notes tropicales intenses avec une pointe soufrée caractéristique.",
    base_unit: "g/kg",
    flavor_profile: [
      { attribute: "Sweetness", value: 50 },
      { attribute: "Sourness", value: 70 },
      { attribute: "Bitterness", value: 10 },
      { attribute: "Umami", value: 5 },
      { attribute: "Saltiness", value: 5 },
    ],
    category_name: "Tropical",
    substances: [
      { common_name: "Ethyl butyrate", concentration: 95.0, unit: "g/kg", order_index: 1, pyramid_position: "top" },
      { common_name: "Ethyl hexanoate", concentration: 45.0, unit: "g/kg", order_index: 2, pyramid_position: "top" },
      { common_name: "Linalool", concentration: 20.0, unit: "g/kg", order_index: 3, pyramid_position: "heart" },
      { common_name: "gamma-Decalactone", concentration: 15.0, unit: "g/kg", order_index: 4, pyramid_position: "base" },
      { common_name: "Hexanal", concentration: 5.0, unit: "g/kg", order_index: 5, pyramid_position: "top" },
    ],
  },
];

// =============================================================================
// WORKSPACES CONFIGURATION
// =============================================================================

interface WorkspaceDocument {
  name: string;
  description: string;
  type: "markdown" | "csv" | "pdf" | "image" | "file";
  content?: string; // For markdown content
  url?: string; // For file URLs
  file_size?: number;
  mime_type?: string;
}

interface WorkspaceConfig {
  name: string;
  description: string;
  created_by_user_id: string | "LMANGALL"; // Special marker for lmangall user
  flavour_names: string[]; // Names of flavours to add to workspace
  documents?: WorkspaceDocument[];
  members?: { user_id: string | "LMANGALL"; role: "editor" | "viewer" }[];
}

const WORKSPACES: WorkspaceConfig[] = [
  {
    name: "Projet de fin d'études - Vanille",
    description: "Projet ISIPCA 3ème année: développement d'une gamme vanille pour application desserts. Collaboration avec tuteur de stage pour validation des formules.",
    created_by_user_id: "demo_arthur_dent",
    flavour_names: ["Vanille Bourbon Madagascar", "Caramel au Beurre Salé"],
    documents: [
      {
        name: "Cahier des charges - Vanille Premium",
        description: "Spécifications techniques et organoleptiques pour la gamme vanille desserts",
        type: "markdown",
        content: `# Cahier des charges - Vanille Premium

## Objectif
Développer une gamme d'arômes vanille pour applications desserts haut de gamme.

## Profil organoleptique cible
- **Note de tête:** Vanille gousse fraîche
- **Note de cœur:** Vanille crémeuse, légèrement caramélisée
- **Note de fond:** Boisé subtil, balsamique

## Applications cibles
1. Crèmes glacées artisanales
2. Pâtisseries fines
3. Yaourts premium

## Contraintes réglementaires
- Conforme FEMA GRAS
- Dosage max: 500 ppm dans application finale

## Planning
- Phase 1: Recherche bibliographique ✅
- Phase 2: Formulation initiale ✅
- Phase 3: Tests sensoriels 🔄
- Phase 4: Optimisation finale ⏳`,
      },
      {
        name: "Résultats panel sensoriel - Semaine 12",
        description: "Données brutes du panel de dégustation du 15/03/2024",
        type: "csv",
        content: `Paneliste,Échantillon,Note globale,Intensité vanille,Crémeux,Boisé,Commentaires
P001,VAR-A,7.5,8,6,4,"Bonne intensité vanille, manque de rondeur"
P002,VAR-A,8.0,7,7,5,"Équilibré, note boisée agréable"
P003,VAR-A,6.5,8,5,3,"Trop intense, pas assez crémeux"
P001,VAR-B,8.5,7,8,4,"Excellent profil crémeux"
P002,VAR-B,8.0,6,8,4,"Parfait pour crème glacée"
P003,VAR-B,7.5,7,7,5,"Bon équilibre général"
P001,VAR-C,6.0,5,7,7,"Note boisée trop présente"
P002,VAR-C,5.5,4,6,8,"Déséquilibré, trop boisé"
P003,VAR-C,6.5,6,6,6,"Acceptable mais pas premium"`,
      },
      {
        name: "Brief Givaudan - Stage 2024",
        description: "Document de briefing reçu du maître de stage",
        type: "pdf",
        url: "https://example.com/documents/brief-givaudan.pdf",
        file_size: 245000,
        mime_type: "application/pdf",
      },
    ],
  },
  {
    name: "Mémoire M2 - Agrumes Artisanaux",
    description: "Travail de mémoire Master 2: étude des profils agrumes pour limonades artisanales. Partenariat avec une brasserie locale lyonnaise.",
    created_by_user_id: "demo_ford_prefect",
    flavour_names: ["Orange Sanguine Sicilienne", "Citron de Menton"],
    documents: [
      {
        name: "État de l'art - Arômes agrumes",
        description: "Revue bibliographique des composés clés des agrumes méditerranéens",
        type: "markdown",
        content: `# État de l'art - Arômes Agrumes Méditerranéens

## Introduction
Les agrumes méditerranéens présentent des profils aromatiques distincts des variétés tropicales.

## Composés clés identifiés

### Orange sanguine (Citrus × sinensis)
| Composé | Concentration typique | Impact sensoriel |
|---------|----------------------|------------------|
| Limonène | 90-95% | Base agrume |
| Linalool | 0.3-0.8% | Floral, frais |
| Decanal | 0.2-0.5% | Zeste, waxy |
| β-Caryophyllène | 0.1-0.3% | Épicé, boisé |

### Citron de Menton (Citrus limon)
| Composé | Concentration typique | Impact sensoriel |
|---------|----------------------|------------------|
| Limonène | 65-75% | Base agrume |
| γ-Terpinène | 8-12% | Herbacé |
| Citral | 3-5% | Citron caractéristique |
| Géraniol | 0.5-1% | Rose, floral |

## Conclusions
Les ratios citral/limonène et la présence de linalool distinguent les profils méditerranéens.

## Références
1. Dugo et al., Flavor and Fragrance Journal, 2020
2. Sawamura, Citrus Essential Oils, 2018`,
      },
      {
        name: "Protocole GC-MS",
        description: "Méthode d'analyse chromatographique pour caractérisation des huiles essentielles",
        type: "pdf",
        url: "https://example.com/documents/protocole-gcms.pdf",
        file_size: 156000,
        mime_type: "application/pdf",
      },
      {
        name: "Données analytiques - HE Citron Menton",
        description: "Résultats GC-MS de l'huile essentielle de citron de Menton 2024",
        type: "csv",
        content: `Composé,Temps rétention (min),Aire (%),Identification
alpha-Pinène,8.23,1.8,MS + RI
beta-Pinène,9.45,12.3,MS + RI
Myrcène,10.12,1.5,MS + RI
Limonène,11.87,68.4,MS + RI + Std
gamma-Terpinène,12.56,9.2,MS + RI
para-Cymène,13.01,0.8,MS + RI
Terpinolène,14.23,0.4,MS + RI
Linalool,15.67,0.3,MS + RI + Std
Citronellal,17.89,0.2,MS + RI
Neral,19.45,1.8,MS + RI
Geranial,20.12,2.4,MS + RI
Géraniol,21.34,0.6,MS + RI + Std
Acétate de néryle,23.56,0.2,MS + RI`,
      },
    ],
  },
  {
    name: "Recherche & Développement - Flaveur",
    description: "Workspace personnel pour le développement de nouvelles formules et la gestion des projets clients. Documentation technique et notes de travail.",
    created_by_user_id: "LMANGALL",
    flavour_names: [],
    documents: [
      {
        name: "Notes de travail - Janvier 2024",
        description: "Notes personnelles sur les projets en cours",
        type: "markdown",
        content: `# Notes de travail - Janvier 2024

## Projets en cours

### Client A - Arôme fraise pour yaourt
- [ ] Finaliser la formule VAR-3
- [ ] Préparer échantillons pour panel
- [x] Valider stabilité à 3 mois

### Client B - Gamme agrumes bio
- Briefing reçu le 15/01
- Contraintes: 100% naturel, certification bio
- Budget: premium
- Deadline: Mars 2024

## Idées à explorer
1. Combinaison lactones + esters pour note pêche plus authentique
2. Tester nouveaux fournisseurs de vanilline naturelle
3. Optimiser ratio maltol/furaneol pour caramel

## Formations prévues
- ISIPCA: Module avancé GC-MS (Février)
- Webinaire Givaudan: Tendances 2024`,
      },
      {
        name: "Template brief client",
        description: "Modèle standard pour la prise de brief avec les clients",
        type: "markdown",
        content: `# Brief Client - [Nom du projet]

## Informations générales
- **Client:**
- **Contact:**
- **Date de brief:**
- **Deadline souhaitée:**

## Description du projet
### Application cible
- Type de produit:
- Segment de marché:
- Zone géographique:

### Profil aromatique souhaité
- Notes de tête:
- Notes de cœur:
- Notes de fond:
- Références benchmark:

## Contraintes techniques
- [ ] Naturel / Nature-identique / Artificiel
- [ ] Bio
- [ ] Végan
- [ ] Sans allergènes
- Dosage cible:
- pH application:
- Traitement thermique:

## Budget et volumes
- Budget indicatif:
- Volume annuel estimé:

## Livrables attendus
- [ ] Échantillons lab
- [ ] Fiche technique
- [ ] Dossier réglementaire
- [ ] Panel sensoriel`,
      },
      {
        name: "Inventaire substances - Q4 2023",
        description: "État des stocks du laboratoire personnel",
        type: "csv",
        content: `Substance,FEMA,CAS,Stock (g),Fournisseur,Date péremption,Remarques
Vanillin,3107,121-33-5,500,Givaudan,2025-06,Stock OK
Ethyl vanillin,3108,121-32-4,250,IFF,2025-03,Commander bientôt
Maltol,2656,118-71-8,100,Symrise,2024-12,Stock bas
Furaneol,3174,3658-77-3,50,Firmenich,2025-09,OK
Diacetyl,2370,431-03-8,150,Givaudan,2024-06,À renouveler
Limonene,2633,5989-27-5,1000,Citrus Extracts,2025-12,Stock OK
Linalool,2635,78-70-6,300,Symrise,2025-06,OK
Citral,2303,5392-40-5,200,IFF,2025-01,Stock OK
Ethyl butyrate,2427,105-54-4,400,Givaudan,2025-03,OK
gamma-Decalactone,2360,706-14-9,75,Firmenich,2025-06,Commander`,
      },
      {
        name: "Logo client exemple",
        description: "Exemple de fichier image uploadé",
        type: "image",
        url: "https://example.com/images/client-logo.png",
        file_size: 45000,
        mime_type: "image/png",
      },
    ],
    members: [
      { user_id: "demo_arthur_dent", role: "editor" },
      { user_id: "demo_ford_prefect", role: "viewer" },
      { user_id: "demo_trillian", role: "viewer" },
    ],
  },
  {
    name: "Projet Stage Givaudan - Tropicaux",
    description: "Documentation et formules développées pendant le stage chez Givaudan. Focus sur les profils tropicaux et floraux pour applications boissons.",
    created_by_user_id: "demo_trillian",
    flavour_names: ["Mangue Alphonso", "Jasmin Sambac", "Fruit de la Passion"],
    documents: [
      {
        name: "Brief Stage - Profils Tropicaux",
        description: "Objectifs et livrables du stage",
        type: "markdown",
        content: `# Brief Stage Givaudan - Profils Tropicaux

## Objectif
Développer une gamme d'arômes tropicaux pour boissons sans alcool premium.

## Profils cibles
1. **Mangue Alphonso** - profil crémeux, sucré
2. **Fruit de la passion** - notes soufrées caractéristiques
3. **Jasmin** - pour accords floraux/fruités

## Contraintes
- 100% conforme FEMA GRAS
- Stable à pH 3.0-4.0
- Résistant à la pasteurisation

## Planning
- Semaines 1-4: Recherche et benchmarking
- Semaines 5-12: Développement formules
- Semaines 13-20: Optimisation et tests applications
- Semaines 21-24: Documentation et présentation`,
      },
    ],
  },
  {
    name: "Collaboration Étudiants ISIPCA",
    description: "Espace de travail partagé avec les étudiants ISIPCA pour le suivi des projets de stage et mémoires.",
    created_by_user_id: "LMANGALL",
    flavour_names: [],
    documents: [
      {
        name: "Guidelines formulation",
        description: "Bonnes pratiques de formulation pour les débutants",
        type: "markdown",
        content: `# Guidelines Formulation Arômes

## Principes fondamentaux

### 1. Structure d'un arôme
Un arôme équilibré comporte généralement:
- **Notes de tête (10-20%):** Premières perçues, volatiles
- **Notes de cœur (40-60%):** Corps de l'arôme
- **Notes de fond (20-30%):** Persistance, fixation

### 2. Règles de dosage
| Type de composé | Dosage typique | Exemples |
|-----------------|----------------|----------|
| Base / Fond | 100-500 ppm | Vanilline, lactones |
| Modificateurs | 10-100 ppm | Maltol, furaneol |
| Top notes | 1-50 ppm | Aldéhydes, esters légers |
| Traceurs | 0.1-10 ppm | Thiols, pyrazines |

### 3. Erreurs courantes à éviter
1. ❌ Surdoser les notes de tête (déséquilibre)
2. ❌ Oublier les fixateurs (manque de tenue)
3. ❌ Négliger les interactions (masquage)
4. ❌ Ignorer l'application finale (pH, chaleur)

## Workflow recommandé
1. Analyse du brief et benchmark
2. Formule skeleton (3-5 composés clés)
3. Itérations par additions successives
4. Validation en application
5. Optimisation finale`,
      },
      {
        name: "Planning stages 2024",
        description: "Calendrier des stages et soutenances",
        type: "csv",
        content: `Étudiant,Entreprise,Début,Fin,Soutenance,Tuteur entreprise,Statut
Tricia McMillan,Givaudan Genève,2024-01-15,2024-06-30,2024-07-05,Jean Dupont,En cours
Random Dent,Brasserie Lyon,2024-02-01,2024-05-31,2024-06-15,Marie Martin,En cours
Alice Wonderland,IFF Paris,2024-03-01,2024-08-31,2024-09-10,Pierre Durand,À venir
Bob Builder,Symrise Grasse,2024-01-08,2024-06-15,2024-06-25,Sophie Blanc,En cours`,
      },
    ],
    members: [
      { user_id: "demo_arthur_dent", role: "editor" },
      { user_id: "demo_ford_prefect", role: "editor" },
      { user_id: "demo_trillian", role: "editor" },
    ],
  },
];

// =============================================================================
// LEARNING DATA CONFIGURATION
// =============================================================================

interface LearningProgressData {
  substance_name: string;
  status: "not_started" | "learning" | "confident" | "mastered";
  has_smelled: boolean;
  has_tasted: boolean;
  personal_notes?: string;
  personal_descriptors?: string[];
  associations?: string;
  days_ago_started?: number; // How many days ago the learning started
  days_ago_mastered?: number; // How many days ago it was mastered (if mastered)
}

interface LearningStreakData {
  current_streak: number;
  longest_streak: number;
  days_since_last_study: number;
  streak_freezes_available: number;
}

interface QuizAttemptData {
  substance_name: string;
  guessed_name: string;
  observations: string;
  result: "correct" | "incorrect" | "partial";
  days_ago: number;
}

interface LearningSessionData {
  name: string;
  description: string;
  days_ago: number;
  duration_minutes: number;
  reflection_notes?: string;
  completed: boolean;
  substances: string[];
}

interface LearningReviewData {
  substance_name: string;
  days_ago_scheduled: number;
  completed: boolean;
  review_result?: "correct" | "incorrect" | "partial";
  confidence_after?: number; // 1-5
  notes?: string;
}

interface UserLearningData {
  user_id: string;
  streak: LearningStreakData;
  progress: LearningProgressData[];
  quiz_attempts: QuizAttemptData[];
  sessions: LearningSessionData[];
  reviews: LearningReviewData[];
  queue: { substance_name: string; priority: number; days_until_target?: number }[];
}

// Tricia is a vanilla/dairy specialist - she's been studying for a few months
const ARTHUR_LEARNING: UserLearningData = {
  user_id: "demo_arthur_dent",
  streak: {
    current_streak: 12,
    longest_streak: 28,
    days_since_last_study: 0, // Studied today
    streak_freezes_available: 2,
  },
  progress: [
    // Mastered substances (vanilla/dairy focus)
    {
      substance_name: "Vanillin",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "La base absolue de tout arôme vanille. Note sucrée, crémeuse avec une légère facette boisée. Très reconnaissable à faible dilution.",
      personal_descriptors: ["sucré", "crémeux", "boisé", "chaleureux"],
      associations: "Gousses de vanille Madagascar, crème brûlée, pâtisserie française",
      days_ago_started: 90,
      days_ago_mastered: 30,
    },
    {
      substance_name: "Ethyl vanillin",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "3x plus puissant que la vanilline. Note plus florale et moins boisée. Excellent pour booster un profil vanille.",
      personal_descriptors: ["floral", "puissant", "crémeux", "doux"],
      associations: "Chocolat blanc, yaourt vanille premium",
      days_ago_started: 85,
      days_ago_mastered: 25,
    },
    {
      substance_name: "Diacetyl",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Caractère beurre très marqué. Attention au dosage, devient vite écœurant. Essentiel pour les profils laitiers.",
      personal_descriptors: ["beurré", "crémeux", "riche", "lacté"],
      associations: "Beurre frais, croissant chaud, pop-corn",
      days_ago_started: 80,
      days_ago_mastered: 20,
    },
    {
      substance_name: "Maltol",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Note caramel/coton de sucre. Excellent modificateur pour arrondir les formules. Se marie très bien avec la vanilline.",
      personal_descriptors: ["caramel", "sucré", "doux", "cotton candy"],
      associations: "Barbe à papa, caramel mou, pralines",
      days_ago_started: 75,
      days_ago_mastered: 15,
    },
    // Confident substances
    {
      substance_name: "Furaneol",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Fraise cuite, caramel, sucré. Clé pour les arômes fraise et caramel. Note distinctive de fraise mûre.",
      personal_descriptors: ["fraise", "caramel", "sucré", "fruité"],
      associations: "Confiture de fraises, caramel au beurre",
      days_ago_started: 60,
    },
    {
      substance_name: "Acetoin",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Beurré, yaourt, crémeux. Plus subtil que le diacétyl. Bon pour les notes lactées légères.",
      personal_descriptors: ["yaourt", "beurré", "doux", "frais"],
      associations: "Yaourt nature, beurre doux",
      days_ago_started: 55,
    },
    {
      substance_name: "delta-Decalactone",
      status: "confident",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Pêche crémeuse, noix de coco. Excellent pour profils laitiers et fruités crémeux.",
      personal_descriptors: ["pêche", "crémeux", "noix de coco", "lacté"],
      associations: "Crème de pêche, yaourt à la pêche",
      days_ago_started: 50,
    },
    // Currently learning
    {
      substance_name: "Heliotropin",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Floral, amande, vanille. Très utilisé en parfumerie. À tester en combinaison avec vanilline.",
      personal_descriptors: ["floral", "amande", "poudré"],
      days_ago_started: 14,
    },
    {
      substance_name: "Guaiacol",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Fumé, médicinal à haute dose. Très puissant! Utiliser avec parcimonie pour note boisée/fumée.",
      personal_descriptors: ["fumé", "boisé", "phénolique"],
      days_ago_started: 7,
    },
    {
      substance_name: "Anisyl alcohol",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Floral, anisé doux. En cours d'exploration pour les notes vanille complexes.",
      personal_descriptors: ["floral", "anisé", "doux"],
      days_ago_started: 3,
    },
  ],
  quiz_attempts: [
    {
      substance_name: "Vanillin",
      guessed_name: "Vanillin",
      observations: "Note sucrée très caractéristique, impossible à confondre",
      result: "correct",
      days_ago: 30,
    },
    {
      substance_name: "Ethyl vanillin",
      guessed_name: "Ethyl vanillin",
      observations: "Plus floral que la vanilline, intensité plus marquée",
      result: "correct",
      days_ago: 25,
    },
    {
      substance_name: "Diacetyl",
      guessed_name: "Diacetyl",
      observations: "Beurre pur, reconnaissable immédiatement",
      result: "correct",
      days_ago: 20,
    },
    {
      substance_name: "Maltol",
      guessed_name: "Ethyl maltol",
      observations: "J'ai confondu avec l'ethyl maltol, mais c'était le maltol simple",
      result: "partial",
      days_ago: 18,
    },
    {
      substance_name: "Maltol",
      guessed_name: "Maltol",
      observations: "Cette fois j'ai bien identifié - note coton de sucre distincte",
      result: "correct",
      days_ago: 15,
    },
    {
      substance_name: "Furaneol",
      guessed_name: "Furaneol",
      observations: "Fraise cuite évidente, légère note caramel",
      result: "correct",
      days_ago: 10,
    },
    {
      substance_name: "Heliotropin",
      guessed_name: "Vanillin",
      observations: "J'ai pensé à la vanilline mais c'était plus floral - héliotropine!",
      result: "incorrect",
      days_ago: 5,
    },
  ],
  sessions: [
    {
      name: "Session Vanille - Bases",
      description: "Étude des composés clés des arômes vanille",
      days_ago: 60,
      duration_minutes: 45,
      reflection_notes: "Bonne session. La vanilline et l'ethyl vanilline sont maintenant bien ancrées. À revoir: héliotropine.",
      completed: true,
      substances: ["Vanillin", "Ethyl vanillin", "Heliotropin"],
    },
    {
      name: "Session Laitiers",
      description: "Focus sur les molécules lactées et beurrées",
      days_ago: 45,
      duration_minutes: 60,
      reflection_notes: "Le diacétyl est très puissant! L'acetoin est plus subtil et versatile. Les lactones apportent la dimension crémeuse.",
      completed: true,
      substances: ["Diacetyl", "Acetoin", "delta-Decalactone"],
    },
    {
      name: "Session Caramel",
      description: "Étude des modificateurs sucrés et caramel",
      days_ago: 30,
      duration_minutes: 30,
      reflection_notes: "Maltol + Furaneol = combo magique pour le caramel. À tester avec cyclotene.",
      completed: true,
      substances: ["Maltol", "Furaneol"],
    },
    {
      name: "Session Vanille Avancée",
      description: "Molécules secondaires pour complexifier les profils vanille",
      days_ago: 7,
      duration_minutes: 40,
      reflection_notes: "Le guaiacol est très délicat à doser. L'anisyl alcohol apporte une belle rondeur.",
      completed: true,
      substances: ["Guaiacol", "Anisyl alcohol", "Heliotropin"],
    },
    {
      name: "Révision Hebdomadaire",
      description: "Révision des acquis de la semaine",
      days_ago: 0,
      duration_minutes: 20,
      completed: false,
      substances: ["Heliotropin", "Guaiacol"],
    },
  ],
  reviews: [
    {
      substance_name: "Vanillin",
      days_ago_scheduled: 30,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
      notes: "Parfaitement maîtrisé",
    },
    {
      substance_name: "Furaneol",
      days_ago_scheduled: 7,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
      notes: "Bonne reconnaissance, à confirmer",
    },
    {
      substance_name: "Heliotropin",
      days_ago_scheduled: 2,
      completed: true,
      review_result: "partial",
      confidence_after: 3,
      notes: "Encore un peu de confusion avec les notes florales",
    },
    {
      substance_name: "Guaiacol",
      days_ago_scheduled: -3, // Scheduled for 3 days in future
      completed: false,
    },
  ],
  queue: [
    { substance_name: "Cyclotene", priority: 1, days_until_target: 7 },
    { substance_name: "Ethyl maltol", priority: 2, days_until_target: 14 },
    { substance_name: "gamma-Nonalactone", priority: 3, days_until_target: 21 },
  ],
};

// Ford is a citrus/fruit specialist - dedicated learner
const FORD_LEARNING: UserLearningData = {
  user_id: "demo_ford_prefect",
  streak: {
    current_streak: 18,
    longest_streak: 32,
    days_since_last_study: 0, // Studied today
    streak_freezes_available: 2,
  },
  progress: [
    // Mastered substances (citrus focus)
    {
      substance_name: "Limonene",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "La base de tous les agrumes! Présent à 90%+ dans les huiles essentielles d'agrumes. Note fraîche, zestée, légèrement terpénique. Indispensable pour ma formule Orange Sanguine.",
      personal_descriptors: ["agrume", "frais", "zesté", "terpénique"],
      associations: "Zeste d'orange, citron frais, pamplemousse, huile essentielle de citron",
      days_ago_started: 90,
      days_ago_mastered: 30,
    },
    {
      substance_name: "Citral",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "L'essence même du citron! Mélange de neral et geranial. Note citron très caractéristique, légèrement herbacée. Clé pour mon Citron de Menton.",
      personal_descriptors: ["citron", "frais", "herbacé", "vif"],
      associations: "Citron de Menton, citronnelle, verveine, lemongrass",
      days_ago_started: 85,
      days_ago_mastered: 25,
    },
    {
      substance_name: "Linalool",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Floral, frais, légèrement boisé. Présent dans de nombreux fruits et fleurs. Donne de la fraîcheur et de la rondeur aux agrumes. Polyvalent!",
      personal_descriptors: ["floral", "frais", "boisé", "lavande"],
      associations: "Lavande, bergamote, coriandre, néroli",
      days_ago_started: 80,
      days_ago_mastered: 20,
    },
    {
      substance_name: "Ethyl butyrate",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Ester fruité par excellence! Note ananas, fraise, tutti-frutti. Très volatile, à doser avec précaution. Base de ma formule Fraise Gariguette.",
      personal_descriptors: ["ananas", "fruité", "tropical", "ester", "fraise"],
      associations: "Ananas frais, bonbon à la fraise, jus de fruits tropicaux",
      days_ago_started: 75,
      days_ago_mastered: 15,
    },
    // Confident substances
    {
      substance_name: "Octanal",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Aldéhyde C8. Note orange verte, zeste, légèrement grasse. Important pour les notes d'agrumes frais. Plus vert et frais que le decanal.",
      personal_descriptors: ["orange", "vert", "aldéhydique", "zeste"],
      associations: "Peau d'orange verte, agrumes non mûrs, zeste frais",
      days_ago_started: 70,
    },
    {
      substance_name: "Decanal",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Aldéhyde C10. Note orange mûre, cireuse, florale. Plus doux et rond que l'octanal. Apporte du naturel aux compositions agrumes.",
      personal_descriptors: ["orange", "cireux", "floral", "doux"],
      associations: "Orange mûre, fleur d'oranger, mandarine",
      days_ago_started: 65,
    },
    {
      substance_name: "Geraniol",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Floral, rose, géranium. Utilisé dans les agrumes pour apporter une note florale douce et naturelle. Présent naturellement dans le citron.",
      personal_descriptors: ["rose", "floral", "doux", "géranium"],
      associations: "Pétales de rose, géranium rosat, litchi",
      days_ago_started: 55,
    },
    {
      substance_name: "Nonanal",
      status: "confident",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Aldéhyde C9. Note rose, cireuse, légèrement grasse. Intermédiaire entre C8 et C10. Donne du volume aux accords floraux-agrumes.",
      personal_descriptors: ["rose", "gras", "aldéhydique", "cireux"],
      associations: "Rose fraîche, peau d'orange, savon de luxe",
      days_ago_started: 50,
    },
    {
      substance_name: "Benzaldehyde",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Amande amère, cerise, noyau. Note caractéristique des fruits à noyau. Utile pour ma formule Pêche de Vigne!",
      personal_descriptors: ["amande", "cerise", "noyau", "marzipan"],
      associations: "Amande amère, cerise griotte, noyau de pêche",
      days_ago_started: 45,
    },
    // Currently learning
    {
      substance_name: "Ethyl hexanoate",
      status: "learning",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Ester fruité, ananas, pomme verte. Plus gras et moins volatile que l'éthyl butyrate. Important pour les profils tropicaux.",
      personal_descriptors: ["ananas", "pomme", "fruité", "gras"],
      days_ago_started: 30,
    },
    {
      substance_name: "Furaneol",
      status: "learning",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Fraise cuite, caramel fruité, barbe à papa. Molécule clé pour les fraises! À explorer davantage pour ma Gariguette.",
      personal_descriptors: ["fraise", "caramel", "cuit", "sucré"],
      days_ago_started: 25,
    },
    {
      substance_name: "Ethyl methylphenylglycidate",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Fraise de synthèse classique, bonbon. Note fraise très reconnaissable, un peu artificielle. Dosage délicat.",
      personal_descriptors: ["fraise", "bonbon", "sucré", "synthétique"],
      days_ago_started: 20,
    },
    {
      substance_name: "Hexanal",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Vert, herbe coupée, pomme verte. Aldéhyde C6, très vert. Utile pour les notes vertes des fruits.",
      personal_descriptors: ["vert", "herbe", "pomme", "feuille"],
      days_ago_started: 15,
    },
    {
      substance_name: "Maltol",
      status: "learning",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Caramel, barbe à papa, sucré. Exhausteur de goût fruité, arrondit les compositions. Synergie avec furaneol.",
      personal_descriptors: ["caramel", "sucré", "barbe à papa", "doux"],
      days_ago_started: 10,
    },
    // Not started but explored
    {
      substance_name: "Benzyl acetate",
      status: "not_started",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Première impression: jasmin, fruité, légèrement banane. Intéressant pour ajouter une touche florale-fruitée.",
      personal_descriptors: ["jasmin", "fruité", "floral"],
      days_ago_started: 5,
    },
    {
      substance_name: "Methyl anthranilate",
      status: "not_started",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Raisin Concord, bonbon au raisin. Note très caractéristique. À explorer pour des profils raisin/fruits rouges.",
      personal_descriptors: ["raisin", "bonbon", "fruité"],
      days_ago_started: 3,
    },
  ],
  quiz_attempts: [
    {
      substance_name: "Limonene",
      guessed_name: "Limonene",
      observations: "Agrume pur, impossible de se tromper. La base!",
      result: "correct",
      days_ago: 60,
    },
    {
      substance_name: "Citral",
      guessed_name: "Citral",
      observations: "Citron caractéristique, note citronnelle évidente",
      result: "correct",
      days_ago: 55,
    },
    {
      substance_name: "Linalool",
      guessed_name: "Linalool",
      observations: "Floral frais, note lavande. Reconnaissable!",
      result: "correct",
      days_ago: 50,
    },
    {
      substance_name: "Ethyl butyrate",
      guessed_name: "Ethyl butyrate",
      observations: "Ananas évident, très fruité et volatile",
      result: "correct",
      days_ago: 45,
    },
    {
      substance_name: "Octanal",
      guessed_name: "Decanal",
      observations: "Confondu les deux aldéhydes, l'octanal est plus vert",
      result: "incorrect",
      days_ago: 40,
    },
    {
      substance_name: "Octanal",
      guessed_name: "Octanal",
      observations: "Cette fois bien identifié - plus vert et frais que le decanal",
      result: "correct",
      days_ago: 38,
    },
    {
      substance_name: "Decanal",
      guessed_name: "Decanal",
      observations: "Plus doux, plus floral, note orange mûre",
      result: "correct",
      days_ago: 35,
    },
    {
      substance_name: "Geraniol",
      guessed_name: "Geraniol",
      observations: "Rose, géranium, très floral",
      result: "correct",
      days_ago: 30,
    },
    {
      substance_name: "Nonanal",
      guessed_name: "Octanal",
      observations: "Difficile! C9 entre C8 et C10, plus rosé",
      result: "incorrect",
      days_ago: 28,
    },
    {
      substance_name: "Nonanal",
      guessed_name: "Nonanal",
      observations: "Mieux distingué cette fois, la note rose est la clé",
      result: "correct",
      days_ago: 25,
    },
    {
      substance_name: "Benzaldehyde",
      guessed_name: "Benzaldehyde",
      observations: "Amande amère évidente, cerise",
      result: "correct",
      days_ago: 20,
    },
    {
      substance_name: "Ethyl hexanoate",
      guessed_name: "Ethyl butyrate",
      observations: "Confondu avec éthyl butyrate, mais plus gras",
      result: "incorrect",
      days_ago: 15,
    },
    {
      substance_name: "Furaneol",
      guessed_name: "Furaneol",
      observations: "Fraise cuite, caramel - très reconnaissable",
      result: "correct",
      days_ago: 10,
    },
    {
      substance_name: "Hexanal",
      guessed_name: "Hexanal",
      observations: "Très vert, herbe coupée, facile",
      result: "correct",
      days_ago: 5,
    },
    {
      substance_name: "Maltol",
      guessed_name: "Ethyl maltol",
      observations: "Hésité entre maltol et éthyl maltol, le maltol est moins fort",
      result: "incorrect",
      days_ago: 3,
    },
  ],
  sessions: [
    {
      name: "Introduction Agrumes",
      description: "Découverte des molécules clés des agrumes",
      days_ago: 90,
      duration_minutes: 75,
      reflection_notes: "Le limonène est vraiment la base de tout. Le citral donne le caractère citron. Session très instructive!",
      completed: true,
      substances: ["Limonene", "Citral", "Linalool"],
    },
    {
      name: "Les Esters Fruités",
      description: "Exploration des esters pour profils fruités",
      days_ago: 75,
      duration_minutes: 60,
      reflection_notes: "L'éthyl butyrate est incroyable - ananas et fraise. Très volatile, à manipuler avec soin.",
      completed: true,
      substances: ["Ethyl butyrate"],
    },
    {
      name: "Les Aldéhydes Agrumes - Partie 1",
      description: "Étude des aldéhydes C8 et C10",
      days_ago: 65,
      duration_minutes: 50,
      reflection_notes: "Série aldéhydique: C8 plus vert, C10 plus floral. La différence est subtile mais importante.",
      completed: true,
      substances: ["Octanal", "Decanal"],
    },
    {
      name: "Les Aldéhydes Agrumes - Partie 2",
      description: "Approfondissement avec le nonanal",
      days_ago: 50,
      duration_minutes: 45,
      reflection_notes: "Le nonanal (C9) est le plus difficile - entre les deux. Note rose caractéristique.",
      completed: true,
      substances: ["Nonanal", "Octanal", "Decanal"],
    },
    {
      name: "Notes Florales pour Agrumes",
      description: "Géraniol et notes rosées",
      days_ago: 45,
      duration_minutes: 40,
      reflection_notes: "Le géraniol apporte une touche florale élégante aux agrumes. Très naturel.",
      completed: true,
      substances: ["Geraniol", "Linalool"],
    },
    {
      name: "Fruits à Noyau",
      description: "Exploration des notes pêche et cerise",
      days_ago: 40,
      duration_minutes: 55,
      reflection_notes: "Le benzaldéhyde est la clé des fruits à noyau. Essentiel pour ma Pêche de Vigne!",
      completed: true,
      substances: ["Benzaldehyde"],
    },
    {
      name: "Profil Fraise Approfondi",
      description: "Molécules clés pour la fraise",
      days_ago: 25,
      duration_minutes: 65,
      reflection_notes: "Furaneol + éthyl butyrate + éthyl methylphenylglycidate = combinaison gagnante pour la fraise.",
      completed: true,
      substances: ["Furaneol", "Ethyl butyrate", "Ethyl methylphenylglycidate"],
    },
    {
      name: "Esters Avancés",
      description: "Comparaison des esters fruités",
      days_ago: 18,
      duration_minutes: 50,
      reflection_notes: "Éthyl hexanoate plus gras, moins piquant que l'éthyl butyrate. Complémentaires!",
      completed: true,
      substances: ["Ethyl hexanoate", "Ethyl butyrate"],
    },
    {
      name: "Notes Vertes Fruitées",
      description: "Hexanal et notes végétales",
      days_ago: 12,
      duration_minutes: 35,
      reflection_notes: "L'hexanal apporte du réalisme aux fruits - la note 'juste coupé'. À utiliser avec parcimonie.",
      completed: true,
      substances: ["Hexanal"],
    },
    {
      name: "Exhausteurs Sucrés",
      description: "Maltol et notes caramélisées",
      days_ago: 8,
      duration_minutes: 40,
      reflection_notes: "Le maltol arrondit et sucre les compositions fruitées. Synergie avec furaneol remarquable.",
      completed: true,
      substances: ["Maltol", "Furaneol"],
    },
  ],
  reviews: [
    {
      substance_name: "Limonene",
      days_ago_scheduled: 60,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
      notes: "Maîtrisé! La base des agrumes.",
    },
    {
      substance_name: "Citral",
      days_ago_scheduled: 50,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
      notes: "Parfait, citron caractéristique.",
    },
    {
      substance_name: "Linalool",
      days_ago_scheduled: 40,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
      notes: "Maîtrisé également!",
    },
    {
      substance_name: "Ethyl butyrate",
      days_ago_scheduled: 30,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
      notes: "Ananas fruité, très reconnaissable.",
    },
    {
      substance_name: "Octanal",
      days_ago_scheduled: 25,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
      notes: "Bien différencié du decanal maintenant.",
    },
    {
      substance_name: "Decanal",
      days_ago_scheduled: 20,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
    },
    {
      substance_name: "Geraniol",
      days_ago_scheduled: 15,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
    },
    {
      substance_name: "Benzaldehyde",
      days_ago_scheduled: 10,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
      notes: "Amande amère, facile!",
    },
    {
      substance_name: "Nonanal",
      days_ago_scheduled: 5,
      completed: true,
      review_result: "correct",
      confidence_after: 3,
      notes: "Encore un peu difficile mais ça vient.",
    },
    {
      substance_name: "Ethyl hexanoate",
      days_ago_scheduled: -3, // Future
      completed: false,
    },
    {
      substance_name: "Furaneol",
      days_ago_scheduled: -5, // Future
      completed: false,
    },
    {
      substance_name: "Maltol",
      days_ago_scheduled: -10, // Future
      completed: false,
    },
  ],
  queue: [
    { substance_name: "Indole", priority: 1, days_until_target: 5 },
    { substance_name: "Guaiacol", priority: 2, days_until_target: 10 },
    { substance_name: "Vanillin", priority: 3, days_until_target: 15 },
    { substance_name: "Acetoin", priority: 4, days_until_target: 20 },
  ],
};

// Trillian is a tropical/floral specialist - she's been studying for a few weeks
const TRILLIAN_LEARNING: UserLearningData = {
  user_id: "demo_trillian",
  streak: {
    current_streak: 8,
    longest_streak: 15,
    days_since_last_study: 0,
    streak_freezes_available: 3,
  },
  progress: [
    {
      substance_name: "Linalool",
      status: "mastered",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Base florale universelle. Présent dans de nombreuses fleurs et agrumes. Note fraîche, légèrement boisée.",
      personal_descriptors: ["floral", "frais", "lavande", "bergamote"],
      associations: "Lavande, bergamote, jasmin",
      days_ago_started: 45,
      days_ago_mastered: 10,
    },
    {
      substance_name: "Geraniol",
      status: "confident",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Rose, géranium. Très utilisé pour les profils floraux. Plus doux que le linalool.",
      personal_descriptors: ["rose", "géranium", "floral", "doux"],
      associations: "Rose, géranium, litchi",
      days_ago_started: 30,
    },
    {
      substance_name: "Benzyl acetate",
      status: "confident",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Jasmin caractéristique. Note florale verte, légèrement fruitée.",
      personal_descriptors: ["jasmin", "floral", "vert", "fruité"],
      associations: "Jasmin, ylang-ylang",
      days_ago_started: 25,
    },
    {
      substance_name: "Ethyl butyrate",
      status: "learning",
      has_smelled: true,
      has_tasted: true,
      personal_notes: "Ananas, tropical. Très volatile! Clé pour les profils tropicaux.",
      personal_descriptors: ["ananas", "tropical", "fruité", "ester"],
      days_ago_started: 14,
    },
    {
      substance_name: "gamma-Decalactone",
      status: "learning",
      has_smelled: true,
      has_tasted: false,
      personal_notes: "Pêche crémeuse. Excellent pour ajouter une dimension lactée aux fruits.",
      personal_descriptors: ["pêche", "crémeux", "lacté"],
      days_ago_started: 7,
    },
  ],
  quiz_attempts: [
    {
      substance_name: "Linalool",
      guessed_name: "Linalool",
      observations: "Note florale fraîche caractéristique",
      result: "correct",
      days_ago: 10,
    },
    {
      substance_name: "Geraniol",
      guessed_name: "Geraniol",
      observations: "Rose évidente, plus doux que le linalool",
      result: "correct",
      days_ago: 7,
    },
    {
      substance_name: "Benzyl acetate",
      guessed_name: "Linalool",
      observations: "Confondu avec linalool au début, mais c'est plus jasmin",
      result: "incorrect",
      days_ago: 5,
    },
  ],
  sessions: [
    {
      name: "Introduction Floraux",
      description: "Découverte des molécules florales de base",
      days_ago: 30,
      duration_minutes: 45,
      reflection_notes: "Le linalool est vraiment polyvalent. Le geraniol apporte la rose.",
      completed: true,
      substances: ["Linalool", "Geraniol"],
    },
    {
      name: "Jasmin et Floraux Blancs",
      description: "Focus sur les notes jasmin et fleurs blanches",
      days_ago: 14,
      duration_minutes: 40,
      reflection_notes: "Le benzyl acetate est la clé du jasmin. À combiner avec indole pour plus de réalisme.",
      completed: true,
      substances: ["Benzyl acetate", "Phenylethyl alcohol"],
    },
  ],
  reviews: [
    {
      substance_name: "Linalool",
      days_ago_scheduled: 10,
      completed: true,
      review_result: "correct",
      confidence_after: 5,
    },
    {
      substance_name: "Geraniol",
      days_ago_scheduled: 3,
      completed: true,
      review_result: "correct",
      confidence_after: 4,
    },
  ],
  queue: [
    { substance_name: "Indole", priority: 1, days_until_target: 5 },
    { substance_name: "Methyl anthranilate", priority: 2, days_until_target: 10 },
    { substance_name: "Phenylethyl alcohol", priority: 3, days_until_target: 15 },
  ],
};

const DEMO_LEARNING_DATA: UserLearningData[] = [ARTHUR_LEARNING, FORD_LEARNING, TRILLIAN_LEARNING];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function findLmangallUserId(): Promise<string | null> {
  // Try to find lmangall user by email pattern (including l.mangallon@gmail.com)
  const results = await sql`
    SELECT user_id FROM users
    WHERE email ILIKE '%lmangall%'
       OR email ILIKE '%mangall%'
       OR email = 'l.mangallon@gmail.com'
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
    SELECT formula_id FROM formula
    WHERE user_id = ${userId} AND name = ${formula.name}
  `;

  if (existing.length > 0) {
    console.log(`  ✓ Flavour already exists: ${formula.name}`);
    return existing[0].formula_id as number;
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
    INSERT INTO formula (
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
    RETURNING formula_id
  `;
  const flavourId = result[0].formula_id as number;
  console.log(`  ✓ Created flavour: ${formula.name} (ID: ${flavourId})`);

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
          ${substanceId}, ${flavourId}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}, ${sub.pyramid_position ?? null}
        )
        ON CONFLICT (substance_id, formula_id) DO NOTHING
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

  // Resolve the actual user ID (handle LMANGALL marker)
  const createdByUserId = config.created_by_user_id === "LMANGALL"
    ? lmangallId
    : config.created_by_user_id;

  if (!createdByUserId) {
    console.log(`⚠ Skipping workspace "${config.name}" - creator user ID not found`);
    return;
  }

  // Check if workspace already exists
  const existing = await sql`
    SELECT workspace_id FROM workspace
    WHERE name = ${config.name} AND created_by = ${createdByUserId}
  `;

  if (existing.length > 0) {
    const existingWorkspaceId = existing[0].workspace_id as number;
    console.log(`✓ Workspace already exists: ${config.name} (ID: ${existingWorkspaceId})`);

    // Add documents to existing workspace if they don't exist
    if (config.documents && config.documents.length > 0 && !dryRun) {
      console.log(`  Adding documents to existing workspace...`);
      for (const doc of config.documents) {
        // Check if document already exists
        const existingDoc = await sql`
          SELECT document_id FROM workspace_document
          WHERE workspace_id = ${existingWorkspaceId} AND name = ${doc.name}
        `;
        if (existingDoc.length === 0) {
          await sql`
            INSERT INTO workspace_document (
              workspace_id, name, description, type, content, url, file_size, mime_type, created_by
            )
            VALUES (
              ${existingWorkspaceId},
              ${doc.name},
              ${doc.description},
              ${doc.type},
              ${doc.content || null},
              ${doc.url || null},
              ${doc.file_size || null},
              ${doc.mime_type || null},
              ${createdByUserId}
            )
          `;
          console.log(`    ✓ Created document: ${doc.name} (${doc.type})`);
        } else {
          console.log(`    ✓ Document already exists: ${doc.name}`);
        }
      }
    } else if (config.documents && config.documents.length > 0 && dryRun) {
      console.log(`  [DRY RUN] Would add ${config.documents.length} documents to existing workspace`);
    }
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would create workspace: ${config.name}`);
    console.log(`[DRY RUN] Creator: ${createdByUserId}`);
    if (config.members) {
      console.log(`[DRY RUN] Would add ${config.members.length} additional members`);
    }
    console.log(`[DRY RUN] Would add ${config.flavour_names.length} flavours`);
    console.log(`[DRY RUN] Would add ${config.documents?.length || 0} documents`);
    return;
  }

  // Create workspace
  const result = await sql`
    INSERT INTO workspace (name, description, created_by)
    VALUES (${config.name}, ${config.description}, ${createdByUserId})
    RETURNING workspace_id
  `;
  const workspaceId = result[0].workspace_id as number;
  console.log(`✓ Created workspace: ${config.name} (ID: ${workspaceId})`);

  // Add creator as owner
  await sql`
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (${workspaceId}, ${createdByUserId}, 'owner')
  `;
  console.log(`✓ Added owner: ${createdByUserId}`);

  // Add configured members
  if (config.members) {
    for (const member of config.members) {
      const memberUserId = member.user_id === "LMANGALL" ? lmangallId : member.user_id;
      if (memberUserId && memberUserId !== createdByUserId) {
        await sql`
          INSERT INTO workspace_member (workspace_id, user_id, role)
          VALUES (${workspaceId}, ${memberUserId}, ${member.role})
          ON CONFLICT (workspace_id, user_id) DO NOTHING
        `;
        console.log(`✓ Added member: ${memberUserId} (${member.role})`);
      }
    }
  }

  // Add lmangall as editor if not already added and workspace is not owned by lmangall
  if (lmangallId && config.created_by_user_id !== "LMANGALL") {
    const alreadyMember = config.members?.some(m =>
      (m.user_id === "LMANGALL") || (m.user_id === lmangallId)
    );
    if (!alreadyMember) {
      await sql`
        INSERT INTO workspace_member (workspace_id, user_id, role)
        VALUES (${workspaceId}, ${lmangallId}, 'editor')
        ON CONFLICT (workspace_id, user_id) DO NOTHING
      `;
      console.log(`✓ Added lmangall as editor`);
    }
  }

  // Add flavours to workspace
  for (const flavourName of config.flavour_names) {
    const flavourId = flavourIdMap.get(flavourName);
    if (flavourId) {
      await sql`
        INSERT INTO workspace_formula (workspace_id, formula_id, added_by)
        VALUES (${workspaceId}, ${flavourId}, ${createdByUserId})
        ON CONFLICT (workspace_id, formula_id) DO NOTHING
      `;
      console.log(`  ✓ Added flavour: ${flavourName}`);
    } else {
      console.log(`  ⚠ Flavour not found: ${flavourName}`);
    }
  }

  // Add documents to workspace
  if (config.documents && config.documents.length > 0) {
    console.log(`  Creating ${config.documents.length} documents...`);
    for (const doc of config.documents) {
      await sql`
        INSERT INTO workspace_document (
          workspace_id, name, description, type, content, url, file_size, mime_type, created_by
        )
        VALUES (
          ${workspaceId},
          ${doc.name},
          ${doc.description},
          ${doc.type},
          ${doc.content || null},
          ${doc.url || null},
          ${doc.file_size || null},
          ${doc.mime_type || null},
          ${createdByUserId}
        )
      `;
      console.log(`    ✓ Created document: ${doc.name} (${doc.type})`);
    }
  }
}

// =============================================================================
// LEARNING DATA SEEDING
// =============================================================================

async function seedLearningData(learningData: UserLearningData): Promise<void> {
  console.log(`\n--- Seeding learning data for: ${learningData.user_id} ---`);

  // Check if user exists
  const userExists = await sql`
    SELECT user_id FROM users WHERE user_id = ${learningData.user_id}
  `;
  if (userExists.length === 0) {
    console.log(`⚠ User not found: ${learningData.user_id}`);
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] Would seed learning data:`);
    console.log(`  - Streak: ${learningData.streak.current_streak} days`);
    console.log(`  - Progress: ${learningData.progress.length} substances`);
    console.log(`  - Quiz attempts: ${learningData.quiz_attempts.length}`);
    console.log(`  - Sessions: ${learningData.sessions.length}`);
    console.log(`  - Reviews: ${learningData.reviews.length}`);
    console.log(`  - Queue: ${learningData.queue.length} substances`);
    return;
  }

  const now = new Date();

  // 1. Seed learning streak
  console.log(`  Creating learning streak...`);
  const lastStudyDate = new Date(now);
  lastStudyDate.setDate(lastStudyDate.getDate() - learningData.streak.days_since_last_study);

  await sql`
    INSERT INTO learning_streak (user_id, current_streak, longest_streak, last_study_date, streak_freezes_available)
    VALUES (
      ${learningData.user_id},
      ${learningData.streak.current_streak},
      ${learningData.streak.longest_streak},
      ${lastStudyDate.toISOString().split("T")[0]},
      ${learningData.streak.streak_freezes_available}
    )
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = EXCLUDED.current_streak,
      longest_streak = EXCLUDED.longest_streak,
      last_study_date = EXCLUDED.last_study_date,
      streak_freezes_available = EXCLUDED.streak_freezes_available
  `;
  console.log(`    ✓ Streak: ${learningData.streak.current_streak} days (longest: ${learningData.streak.longest_streak})`);

  // 2. Seed substance learning progress
  console.log(`  Creating learning progress...`);
  let progressCount = 0;
  for (const progress of learningData.progress) {
    const substanceResult = await sql`
      SELECT substance_id FROM substance WHERE common_name ILIKE ${progress.substance_name} LIMIT 1
    `;
    if (substanceResult.length === 0) {
      console.log(`    ⚠ Substance not found: ${progress.substance_name}`);
      continue;
    }
    const substanceId = substanceResult[0].substance_id;

    const startedAt = progress.days_ago_started
      ? new Date(now.getTime() - progress.days_ago_started * 24 * 60 * 60 * 1000)
      : null;
    const masteredAt = progress.days_ago_mastered
      ? new Date(now.getTime() - progress.days_ago_mastered * 24 * 60 * 60 * 1000)
      : null;
    const smelledAt = progress.has_smelled && startedAt ? startedAt : null;
    const tastedAt = progress.has_tasted && startedAt
      ? new Date(startedAt.getTime() + 24 * 60 * 60 * 1000)
      : null;

    await sql`
      INSERT INTO substance_learning_progress (
        user_id, substance_id, status, has_smelled, smelled_at, has_tasted, tasted_at,
        personal_notes, personal_descriptors, associations, started_at, mastered_at
      )
      VALUES (
        ${learningData.user_id},
        ${substanceId},
        ${progress.status},
        ${progress.has_smelled},
        ${smelledAt?.toISOString() || null},
        ${progress.has_tasted},
        ${tastedAt?.toISOString() || null},
        ${progress.personal_notes || null},
        ${progress.personal_descriptors || null},
        ${progress.associations || null},
        ${startedAt?.toISOString() || null},
        ${masteredAt?.toISOString() || null}
      )
      ON CONFLICT (user_id, substance_id) DO UPDATE SET
        status = EXCLUDED.status,
        has_smelled = EXCLUDED.has_smelled,
        smelled_at = EXCLUDED.smelled_at,
        has_tasted = EXCLUDED.has_tasted,
        tasted_at = EXCLUDED.tasted_at,
        personal_notes = EXCLUDED.personal_notes,
        personal_descriptors = EXCLUDED.personal_descriptors,
        associations = EXCLUDED.associations,
        started_at = EXCLUDED.started_at,
        mastered_at = EXCLUDED.mastered_at,
        updated_at = CURRENT_TIMESTAMP
    `;
    progressCount++;
  }
  console.log(`    ✓ ${progressCount} substance progress records`);

  // 3. Seed quiz attempts
  console.log(`  Creating quiz attempts...`);
  let quizCount = 0;
  for (const attempt of learningData.quiz_attempts) {
    const substanceResult = await sql`
      SELECT substance_id FROM substance WHERE common_name ILIKE ${attempt.substance_name} LIMIT 1
    `;
    if (substanceResult.length === 0) continue;
    const substanceId = substanceResult[0].substance_id;

    const attemptDate = new Date(now.getTime() - attempt.days_ago * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO learning_quiz_attempt (user_id, substance_id, guessed_name, observations, result, created_at)
      VALUES (
        ${learningData.user_id},
        ${substanceId},
        ${attempt.guessed_name},
        ${attempt.observations},
        ${attempt.result},
        ${attemptDate.toISOString()}
      )
    `;
    quizCount++;
  }
  console.log(`    ✓ ${quizCount} quiz attempts`);

  // 4. Seed learning sessions
  console.log(`  Creating learning sessions...`);
  for (const session of learningData.sessions) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() - session.days_ago);

    const sessionResult = await sql`
      INSERT INTO learning_session (
        user_id, name, description, scheduled_for, duration_minutes, reflection_notes, completed_at
      )
      VALUES (
        ${learningData.user_id},
        ${session.name},
        ${session.description},
        ${sessionDate.toISOString().split("T")[0]},
        ${session.duration_minutes},
        ${session.reflection_notes || null},
        ${session.completed ? sessionDate.toISOString() : null}
      )
      RETURNING session_id
    `;
    const sessionId = sessionResult[0].session_id;

    // Add substances to session
    let orderIndex = 0;
    for (const substanceName of session.substances) {
      const substanceResult = await sql`
        SELECT substance_id FROM substance WHERE common_name ILIKE ${substanceName} LIMIT 1
      `;
      if (substanceResult.length === 0) continue;
      const substanceId = substanceResult[0].substance_id;

      await sql`
        INSERT INTO learning_session_substance (session_id, substance_id, order_index)
        VALUES (${sessionId}, ${substanceId}, ${orderIndex})
        ON CONFLICT (session_id, substance_id) DO NOTHING
      `;
      orderIndex++;
    }
    console.log(`    ✓ Session: "${session.name}" (${session.substances.length} substances)`);
  }

  // 5. Seed learning reviews
  console.log(`  Creating learning reviews...`);
  let reviewCount = 0;
  for (const review of learningData.reviews) {
    const substanceResult = await sql`
      SELECT substance_id FROM substance WHERE common_name ILIKE ${review.substance_name} LIMIT 1
    `;
    if (substanceResult.length === 0) continue;
    const substanceId = substanceResult[0].substance_id;

    const scheduledFor = new Date(now.getTime() - review.days_ago_scheduled * 24 * 60 * 60 * 1000);
    const completedAt = review.completed ? scheduledFor : null;

    await sql`
      INSERT INTO learning_review (
        user_id, substance_id, scheduled_for, completed_at, review_result, confidence_after, notes
      )
      VALUES (
        ${learningData.user_id},
        ${substanceId},
        ${scheduledFor.toISOString()},
        ${completedAt?.toISOString() || null},
        ${review.review_result || null},
        ${review.confidence_after || null},
        ${review.notes || null}
      )
    `;
    reviewCount++;
  }
  console.log(`    ✓ ${reviewCount} reviews`);

  // 6. Seed learning queue
  console.log(`  Creating learning queue...`);
  let queueCount = 0;
  for (const item of learningData.queue) {
    const substanceResult = await sql`
      SELECT substance_id FROM substance WHERE common_name ILIKE ${item.substance_name} LIMIT 1
    `;
    if (substanceResult.length === 0) {
      console.log(`    ⚠ Substance not found for queue: ${item.substance_name}`);
      continue;
    }
    const substanceId = substanceResult[0].substance_id;

    const targetDate = item.days_until_target
      ? new Date(now.getTime() + item.days_until_target * 24 * 60 * 60 * 1000)
      : null;

    await sql`
      INSERT INTO user_learning_queue (user_id, substance_id, priority, target_date)
      VALUES (
        ${learningData.user_id},
        ${substanceId},
        ${item.priority},
        ${targetDate?.toISOString().split("T")[0] || null}
      )
      ON CONFLICT (user_id, substance_id) DO UPDATE SET
        priority = EXCLUDED.priority,
        target_date = EXCLUDED.target_date
    `;
    queueCount++;
  }
  console.log(`    ✓ ${queueCount} items in queue`);
}

async function cleanLearningData(userIds: string[]): Promise<void> {
  console.log(`\n--- Cleaning learning data ---`);

  for (const userId of userIds) {
    // Delete learning streak
    await sql`DELETE FROM learning_streak WHERE user_id = ${userId}`;

    // Delete learning progress
    const progressDeleted = await sql`
      DELETE FROM substance_learning_progress WHERE user_id = ${userId}
      RETURNING progress_id
    `;

    // Delete quiz attempts
    const quizDeleted = await sql`
      DELETE FROM learning_quiz_attempt WHERE user_id = ${userId}
      RETURNING attempt_id
    `;

    // Delete learning sessions (cascades to session_substance)
    const sessionsDeleted = await sql`
      DELETE FROM learning_session WHERE user_id = ${userId}
      RETURNING session_id
    `;

    // Delete learning reviews
    const reviewsDeleted = await sql`
      DELETE FROM learning_review WHERE user_id = ${userId}
      RETURNING review_id
    `;

    // Delete learning queue
    const queueDeleted = await sql`
      DELETE FROM user_learning_queue WHERE user_id = ${userId}
      RETURNING queue_id
    `;

    console.log(`✓ Cleaned learning data for ${userId}:`);
    console.log(`    Progress: ${progressDeleted.length}, Quiz: ${quizDeleted.length}, Sessions: ${sessionsDeleted.length}`);
    console.log(`    Reviews: ${reviewsDeleted.length}, Queue: ${queueDeleted.length}`);
  }
}

async function cleanDemoData(): Promise<void> {
  console.log("\n=== Cleaning Demo Users Data ===\n");

  const userIds = DEMO_USERS.map((u) => u.user_id);

  // Find lmangall to clean their seeded workspaces
  const lmangallId = lmangallIdArg?.split("=")[1] || await findLmangallUserId();

  if (dryRun) {
    console.log(`[DRY RUN] Would delete data for users: ${userIds.join(", ")}`);
    console.log(`[DRY RUN] Would delete learning data for demo users`);
    if (lmangallId) {
      console.log(`[DRY RUN] Would delete seeded workspaces for lmangall: ${lmangallId}`);
    }
    return;
  }

  // Clean learning data first (before deleting users)
  await cleanLearningData(userIds);

  // Delete lmangall's seeded workspaces (by name pattern)
  if (lmangallId) {
    const lmangallWorkspaceNames = WORKSPACES
      .filter(w => w.created_by_user_id === "LMANGALL")
      .map(w => w.name);

    for (const wsName of lmangallWorkspaceNames) {
      const deleted = await sql`
        DELETE FROM workspace
        WHERE created_by = ${lmangallId} AND name = ${wsName}
        RETURNING workspace_id
      `;
      if (deleted.length > 0) {
        console.log(`✓ Deleted workspace: "${wsName}" (owned by lmangall)`);
      }
    }
  }

  // Delete workspaces (will cascade to members, flavours, documents)
  for (const userId of userIds) {
    const workspacesDeleted = await sql`
      DELETE FROM workspace WHERE created_by = ${userId}
      RETURNING workspace_id
    `;
    console.log(`✓ Deleted ${workspacesDeleted.length} workspaces for ${userId}`);

    // Delete formulas
    const flavoursDeleted = await sql`
      DELETE FROM formula WHERE user_id = ${userId}
      RETURNING formula_id
    `;
    console.log(`✓ Deleted ${flavoursDeleted.length} formulas for ${userId}`);

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
    const formulas = user.user_id === "demo_arthur_dent"
      ? ARTHUR_FLAVOURS
      : user.user_id === "demo_ford_prefect"
        ? FORD_FLAVOURS
        : TRILLIAN_FLAVOURS;

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

  // Seed learning data for demo users
  console.log("\n=== Seeding Learning Data ===");
  for (const learningData of DEMO_LEARNING_DATA) {
    await seedLearningData(learningData);
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
