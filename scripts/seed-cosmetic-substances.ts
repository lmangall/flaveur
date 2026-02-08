/**
 * Seed script for core cosmetic substances (~120 ingredients)
 *
 * Usage:
 *   npx tsx scripts/seed-cosmetic-substances.ts           # Insert all
 *   npx tsx scripts/seed-cosmetic-substances.ts --dry-run  # Preview only
 *   npx tsx scripts/seed-cosmetic-substances.ts --clean    # Delete cosmetic-only substances first
 *
 * Each substance includes: common_name, inci_name, cas_id, cosmetic_role[],
 * hlb_value, hlb_required, ph_range_min/max, water_solubility, domain
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

// CLI args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const clean = args.includes("--clean");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CosmeticSubstance {
  common_name: string;
  inci_name: string;
  cas_id: string | null;
  molecular_weight?: number | null;
  cosmetic_role: string[];
  hlb_value?: number | null;
  hlb_required?: number | null;
  ph_range_min?: number | null;
  ph_range_max?: number | null;
  water_solubility: "soluble" | "insoluble" | "partially" | "dispersible";
  domain: "cosmetic" | "both";
  description?: string | null;
}

// ---------------------------------------------------------------------------
// COSMETIC SUBSTANCES DATA
// ---------------------------------------------------------------------------

const EMULSIFIERS: CosmeticSubstance[] = [
  {
    common_name: "Polysorbate 20",
    inci_name: "POLYSORBATE 20",
    cas_id: "9005-64-5",
    molecular_weight: 1228,
    cosmetic_role: ["emulsifier"],
    hlb_value: 16.7,
    ph_range_min: 4.0,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Nonionic O/W emulsifier and solubilizer. Commonly used to incorporate essential oils into aqueous formulations.",
  },
  {
    common_name: "Polysorbate 60",
    inci_name: "POLYSORBATE 60",
    cas_id: "9005-67-8",
    molecular_weight: 1312,
    cosmetic_role: ["emulsifier"],
    hlb_value: 14.9,
    ph_range_min: 4.0,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "O/W emulsifier for creams and lotions. Produces stable, creamy emulsions.",
  },
  {
    common_name: "Polysorbate 80",
    inci_name: "POLYSORBATE 80",
    cas_id: "9005-65-6",
    molecular_weight: 1310,
    cosmetic_role: ["emulsifier"],
    hlb_value: 15.0,
    ph_range_min: 4.0,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Versatile O/W emulsifier and solubilizer. Often paired with Sorbitan Oleate (Span 80) for stable emulsions.",
  },
  {
    common_name: "Sorbitan Oleate",
    inci_name: "SORBITAN OLEATE",
    cas_id: "1338-43-8",
    molecular_weight: 428.6,
    cosmetic_role: ["emulsifier"],
    hlb_value: 4.3,
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "W/O emulsifier (Span 80). Used in cold creams, W/O lotions, and as co-emulsifier.",
  },
  {
    common_name: "Sorbitan Stearate",
    inci_name: "SORBITAN STEARATE",
    cas_id: "1338-41-6",
    molecular_weight: 430.6,
    cosmetic_role: ["emulsifier"],
    hlb_value: 4.7,
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "W/O emulsifier (Span 60). Gives body and stability to creams.",
  },
  {
    common_name: "Glyceryl Stearate",
    inci_name: "GLYCERYL STEARATE",
    cas_id: "31566-31-1",
    molecular_weight: 358.6,
    cosmetic_role: ["emulsifier", "structure"],
    hlb_value: 3.8,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Mild W/O emulsifier that also acts as co-emulsifier and opacifier. Derived from vegetable oils.",
  },
  {
    common_name: "Glyceryl Stearate SE",
    inci_name: "GLYCERYL STEARATE SE",
    cas_id: "11099-07-3",
    molecular_weight: 358.6,
    cosmetic_role: ["emulsifier"],
    hlb_value: 5.8,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Self-emulsifying version of glyceryl stearate. Contains sodium or potassium stearate for higher HLB.",
  },
  {
    common_name: "Cetearyl Alcohol (and) Ceteareth-20",
    inci_name: "CETEARYL ALCOHOL (AND) CETEARETH-20",
    cas_id: null,
    cosmetic_role: ["emulsifier", "structure"],
    hlb_value: 15.2,
    ph_range_min: 3.5,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Complete emulsifying wax for O/W emulsions. One of the most common emulsifier systems in lotions and creams.",
  },
  {
    common_name: "Cetearyl Olivate (and) Sorbitan Olivate",
    inci_name: "CETEARYL OLIVATE (AND) SORBITAN OLIVATE",
    cas_id: null,
    cosmetic_role: ["emulsifier"],
    hlb_value: 10.0,
    ph_range_min: 3.5,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Olivem 1000. Olive-derived emulsifier creating liquid crystal structures that mimic skin lipids.",
  },
  {
    common_name: "PEG-40 Hydrogenated Castor Oil",
    inci_name: "PEG-40 HYDROGENATED CASTOR OIL",
    cas_id: "61788-85-0",
    cosmetic_role: ["emulsifier"],
    hlb_value: 15.0,
    ph_range_min: 4.0,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Excellent solubilizer for essential oils and fragrances in aqueous systems.",
  },
  {
    common_name: "Lecithin",
    inci_name: "LECITHIN",
    cas_id: "8002-43-5",
    molecular_weight: 758,
    cosmetic_role: ["emulsifier", "active"],
    hlb_value: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "dispersible",
    domain: "cosmetic",
    description: "Natural phospholipid emulsifier. Also acts as skin-identical ingredient and liposome former.",
  },
];

const OILS_AND_BUTTERS: CosmeticSubstance[] = [
  {
    common_name: "Sweet Almond Oil",
    inci_name: "PRUNUS AMYGDALUS DULCIS OIL",
    cas_id: "8007-69-0",
    cosmetic_role: ["sensory"],
    hlb_required: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Light, easily absorbed carrier oil rich in oleic acid. Suitable for all skin types.",
  },
  {
    common_name: "Jojoba Oil",
    inci_name: "SIMMONDSIA CHINENSIS SEED OIL",
    cas_id: "61789-91-1",
    cosmetic_role: ["sensory"],
    hlb_required: 6.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Liquid wax ester mimicking skin sebum. Excellent stability and shelf life. Non-comedogenic.",
  },
  {
    common_name: "Argan Oil",
    inci_name: "ARGANIA SPINOSA KERNEL OIL",
    cas_id: "223747-87-1",
    cosmetic_role: ["sensory", "active"],
    hlb_required: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Rich in vitamin E and fatty acids. Premium oil for skin and hair care.",
  },
  {
    common_name: "Coconut Oil",
    inci_name: "COCOS NUCIFERA OIL",
    cas_id: "8001-31-8",
    cosmetic_role: ["sensory"],
    hlb_required: 8.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Solid below 25°C. Rich in lauric acid with antimicrobial properties. Can be comedogenic for some skin types.",
  },
  {
    common_name: "Shea Butter",
    inci_name: "BUTYROSPERMUM PARKII BUTTER",
    cas_id: "194043-92-0",
    cosmetic_role: ["sensory", "structure"],
    hlb_required: 8.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Rich butter with high unsaponifiables. Excellent emollient, moisturizer, and skin protectant.",
  },
  {
    common_name: "Cocoa Butter",
    inci_name: "THEOBROMA CACAO SEED BUTTER",
    cas_id: "8002-31-1",
    cosmetic_role: ["sensory", "structure"],
    hlb_required: 6.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Hard butter melting at ~34°C. Provides structure to balms and sticks. Occlusive moisturizer.",
  },
  {
    common_name: "Avocado Oil",
    inci_name: "PERSEA GRATISSIMA OIL",
    cas_id: "8024-32-6",
    cosmetic_role: ["sensory", "active"],
    hlb_required: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Rich, nourishing oil high in oleic acid and phytosterols. Excellent for dry and mature skin.",
  },
  {
    common_name: "Rosehip Seed Oil",
    inci_name: "ROSA CANINA SEED OIL",
    cas_id: "84603-93-0",
    cosmetic_role: ["sensory", "active"],
    hlb_required: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Dry oil rich in linoleic acid and trans-retinoic acid. Prized for anti-aging and scar healing.",
  },
  {
    common_name: "Castor Oil",
    inci_name: "RICINUS COMMUNIS SEED OIL",
    cas_id: "8001-79-4",
    cosmetic_role: ["sensory"],
    hlb_required: 14.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Very viscous oil rich in ricinoleic acid. Used in lip products, mascaras, and as a humectant oil.",
  },
  {
    common_name: "Sunflower Seed Oil",
    inci_name: "HELIANTHUS ANNUUS SEED OIL",
    cas_id: "8001-21-6",
    cosmetic_role: ["sensory"],
    hlb_required: 7.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Light, affordable carrier oil high in linoleic acid. Non-comedogenic, suitable for oily skin.",
  },
  {
    common_name: "Caprylic/Capric Triglyceride",
    inci_name: "CAPRYLIC/CAPRIC TRIGLYCERIDE",
    cas_id: "65381-09-1",
    molecular_weight: 470.7,
    cosmetic_role: ["sensory"],
    hlb_required: 5.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Lightweight fractionated coconut oil. Excellent spreadability, non-greasy feel. Very stable.",
  },
  {
    common_name: "Squalane",
    inci_name: "SQUALANE",
    cas_id: "111-01-3",
    molecular_weight: 422.8,
    cosmetic_role: ["sensory"],
    hlb_required: 5.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Skin-identical lipid (hydrogenated squalene). Ultra-light, non-comedogenic. Olive or sugarcane derived.",
  },
  {
    common_name: "Isopropyl Myristate",
    inci_name: "ISOPROPYL MYRISTATE",
    cas_id: "110-27-0",
    molecular_weight: 270.5,
    cosmetic_role: ["sensory"],
    hlb_required: 4.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Lightweight synthetic ester. Fast-absorbing, non-greasy. Also used as penetration enhancer.",
  },
  {
    common_name: "Mineral Oil",
    inci_name: "PARAFFINUM LIQUIDUM",
    cas_id: "8012-95-1",
    cosmetic_role: ["sensory"],
    hlb_required: 10.5,
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Purified petroleum-derived oil. Excellent occlusive. Cosmetic grade is highly refined and inert.",
  },
];

const WAXES_AND_STRUCTURE: CosmeticSubstance[] = [
  {
    common_name: "Beeswax",
    inci_name: "CERA ALBA",
    cas_id: "8012-89-3",
    cosmetic_role: ["structure"],
    hlb_required: 9.0,
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Natural wax providing structure, thickness, and water resistance. Melting point ~62-65°C.",
  },
  {
    common_name: "Cetyl Alcohol",
    inci_name: "CETYL ALCOHOL",
    cas_id: "36653-82-4",
    molecular_weight: 242.4,
    cosmetic_role: ["structure", "thickener"],
    hlb_required: 13.0,
    ph_range_min: 4.5,
    ph_range_max: 7.5,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Fatty alcohol thickener and co-emulsifier. Adds body and viscosity to creams and lotions.",
  },
  {
    common_name: "Cetearyl Alcohol",
    inci_name: "CETEARYL ALCOHOL",
    cas_id: "67762-27-0",
    cosmetic_role: ["structure", "thickener"],
    hlb_required: 13.0,
    ph_range_min: 4.5,
    ph_range_max: 7.5,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Blend of cetyl and stearyl alcohol. Key thickener and stabilizer in emulsions.",
  },
  {
    common_name: "Stearic Acid",
    inci_name: "STEARIC ACID",
    cas_id: "57-11-4",
    molecular_weight: 284.5,
    cosmetic_role: ["structure", "emulsifier"],
    hlb_required: 15.0,
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Fatty acid that acts as thickener, hardener, and co-emulsifier (forms soap with alkali).",
  },
  {
    common_name: "Candelilla Wax",
    inci_name: "EUPHORBIA CERIFERA WAX",
    cas_id: "8006-44-8",
    cosmetic_role: ["structure"],
    hlb_required: 9.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Vegan alternative to beeswax. Harder, glossier. Melting point ~68-73°C. Used in lip products.",
  },
  {
    common_name: "Carnauba Wax",
    inci_name: "COPERNICIA CERIFERA WAX",
    cas_id: "8015-86-9",
    cosmetic_role: ["structure"],
    hlb_required: 9.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Hardest natural wax. Melting point ~82-86°C. Gives glossy, firm finish to lip products and mascaras.",
  },
];

const HUMECTANTS: CosmeticSubstance[] = [
  {
    common_name: "Glycerin",
    inci_name: "GLYCERIN",
    cas_id: "56-81-5",
    molecular_weight: 92.1,
    cosmetic_role: ["humectant", "solvent"],
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "both",
    description: "The most widely used humectant. Draws moisture from the dermis and air. Use at 2-10% in formulations.",
  },
  {
    common_name: "Sodium Hyaluronate",
    inci_name: "SODIUM HYALURONATE",
    cas_id: "9067-32-7",
    cosmetic_role: ["humectant", "active"],
    ph_range_min: 5.0,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Salt of hyaluronic acid. Holds up to 1000x its weight in water. Use at 0.1-2%. Add to water phase below 40°C.",
  },
  {
    common_name: "Panthenol",
    inci_name: "PANTHENOL",
    cas_id: "81-13-0",
    molecular_weight: 205.3,
    cosmetic_role: ["humectant", "active"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Pro-vitamin B5. Penetrates skin, converts to pantothenic acid. Moisturizing and soothing. Use at 1-5%.",
  },
  {
    common_name: "Propylene Glycol",
    inci_name: "PROPYLENE GLYCOL",
    cas_id: "57-55-6",
    molecular_weight: 76.1,
    cosmetic_role: ["humectant", "solvent"],
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Humectant, solvent, and penetration enhancer. Can be irritating above 5% for sensitive skin.",
  },
  {
    common_name: "Butylene Glycol",
    inci_name: "BUTYLENE GLYCOL",
    cas_id: "107-88-0",
    molecular_weight: 90.1,
    cosmetic_role: ["humectant", "solvent"],
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Lighter than propylene glycol, less irritating. Good solvent for actives. Use at 1-10%.",
  },
  {
    common_name: "Urea",
    inci_name: "UREA",
    cas_id: "57-13-6",
    molecular_weight: 60.1,
    cosmetic_role: ["humectant", "active"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Powerful humectant and keratolytic. At 5-10%: moisturizing. At 20-40%: exfoliating. Add to cool-down phase.",
  },
  {
    common_name: "Sodium PCA",
    inci_name: "SODIUM PCA",
    cas_id: "28874-51-3",
    molecular_weight: 151.1,
    cosmetic_role: ["humectant"],
    ph_range_min: 4.5,
    ph_range_max: 6.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Natural component of skin's NMF (Natural Moisturizing Factor). Excellent moisture binding. Use at 2-5%.",
  },
  {
    common_name: "Aloe Vera Gel",
    inci_name: "ALOE BARBADENSIS LEAF JUICE",
    cas_id: "85507-69-3",
    cosmetic_role: ["humectant", "active"],
    ph_range_min: 4.0,
    ph_range_max: 6.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Soothing, hydrating botanical. Can replace part of water phase. Use at 1-50%.",
  },
];

const SILICONES: CosmeticSubstance[] = [
  {
    common_name: "Dimethicone",
    inci_name: "DIMETHICONE",
    cas_id: "9006-65-9",
    cosmetic_role: ["sensory"],
    hlb_required: 5.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Most common silicone. Creates silky, non-greasy protective film. Available in various viscosities.",
  },
  {
    common_name: "Cyclomethicone",
    inci_name: "CYCLOPENTASILOXANE",
    cas_id: "541-02-6",
    molecular_weight: 370.8,
    cosmetic_role: ["sensory", "solvent"],
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Volatile silicone. Evaporates leaving silky feel. Carrier for other silicones and actives.",
  },
  {
    common_name: "Dimethicone Crosspolymer",
    inci_name: "DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER",
    cas_id: "68083-19-2",
    cosmetic_role: ["sensory", "thickener"],
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Silicone elastomer gel. Creates velvety, primer-like feel. Blurs pores. Use at 1-5%.",
  },
  {
    common_name: "Cetyl Dimethicone",
    inci_name: "CETYL DIMETHICONE",
    cas_id: "17955-88-3",
    cosmetic_role: ["sensory", "emulsifier"],
    hlb_value: 2.0,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Waxy silicone W/O emulsifier. Creates water-resistant, elegant-feeling formulations.",
  },
];

const THICKENERS: CosmeticSubstance[] = [
  {
    common_name: "Carbomer 940",
    inci_name: "CARBOMER",
    cas_id: "9003-01-4",
    cosmetic_role: ["thickener"],
    ph_range_min: 5.0,
    ph_range_max: 10.0,
    water_solubility: "dispersible",
    domain: "cosmetic",
    description: "Cross-linked polyacrylic acid. Must be neutralized with alkali (NaOH or TEA) to thicken. Use at 0.1-0.5%.",
  },
  {
    common_name: "Xanthan Gum",
    inci_name: "XANTHAN GUM",
    cas_id: "11138-66-2",
    cosmetic_role: ["thickener"],
    ph_range_min: 3.0,
    ph_range_max: 12.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Natural polysaccharide thickener. Stable across wide pH and temperature range. Use at 0.1-1%.",
  },
  {
    common_name: "Hydroxyethylcellulose",
    inci_name: "HYDROXYETHYLCELLULOSE",
    cas_id: "9004-62-0",
    cosmetic_role: ["thickener"],
    ph_range_min: 2.0,
    ph_range_max: 12.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Nonionic cellulose-derived thickener. Works across full pH range. Clear gels. Use at 0.5-2%.",
  },
  {
    common_name: "Guar Gum",
    inci_name: "CYAMOPSIS TETRAGONOLOBA GUM",
    cas_id: "9000-30-0",
    cosmetic_role: ["thickener"],
    ph_range_min: 4.0,
    ph_range_max: 10.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Natural galactomannan thickener. Good hair conditioning properties. Use at 0.1-1%.",
  },
  {
    common_name: "Sodium Polyacrylate",
    inci_name: "SODIUM POLYACRYLATE",
    cas_id: "9003-04-7",
    cosmetic_role: ["thickener"],
    ph_range_min: 5.0,
    ph_range_max: 8.0,
    water_solubility: "dispersible",
    domain: "cosmetic",
    description: "Pre-neutralized thickener. No need to adjust pH. Creates creamy gels. Use at 0.5-2%.",
  },
];

const PRESERVATIVES: CosmeticSubstance[] = [
  {
    common_name: "Phenoxyethanol",
    inci_name: "PHENOXYETHANOL",
    cas_id: "122-99-6",
    molecular_weight: 138.2,
    cosmetic_role: ["preservative"],
    ph_range_min: 3.0,
    ph_range_max: 10.0,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "Broad-spectrum preservative effective against gram-negative bacteria. Max 1% in EU. Works across wide pH range.",
  },
  {
    common_name: "Sodium Benzoate",
    inci_name: "SODIUM BENZOATE",
    cas_id: "532-32-1",
    molecular_weight: 144.1,
    cosmetic_role: ["preservative"],
    ph_range_min: 2.0,
    ph_range_max: 5.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Most effective below pH 5. Often combined with potassium sorbate. Use at 0.5-1%.",
  },
  {
    common_name: "Potassium Sorbate",
    inci_name: "POTASSIUM SORBATE",
    cas_id: "24634-61-5",
    molecular_weight: 150.2,
    cosmetic_role: ["preservative"],
    ph_range_min: 2.0,
    ph_range_max: 5.5,
    water_solubility: "soluble",
    domain: "both",
    description: "Effective against yeasts and molds below pH 5.5. Pair with sodium benzoate for broad-spectrum coverage.",
  },
  {
    common_name: "Benzisothiazolinone",
    inci_name: "BENZISOTHIAZOLINONE",
    cas_id: "2634-33-5",
    molecular_weight: 151.2,
    cosmetic_role: ["preservative"],
    ph_range_min: 3.0,
    ph_range_max: 9.0,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "Broad-spectrum preservative booster. Use at very low levels (0.01-0.05%). Often paired with phenoxyethanol.",
  },
  {
    common_name: "Dehydroacetic Acid (and) Benzyl Alcohol",
    inci_name: "DEHYDROACETIC ACID (AND) BENZYL ALCOHOL",
    cas_id: null,
    cosmetic_role: ["preservative"],
    ph_range_min: 3.0,
    ph_range_max: 6.5,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "Broad-spectrum preservative blend. Popular in natural cosmetics. Use at 0.5-1%.",
  },
  {
    common_name: "Tocopherol",
    inci_name: "TOCOPHEROL",
    cas_id: "59-02-9",
    molecular_weight: 430.7,
    cosmetic_role: ["antioxidant"],
    water_solubility: "insoluble",
    domain: "both",
    description: "Vitamin E. Protects oils from rancidity (antioxidant, not a preservative). Add to oil phase at 0.05-0.5%.",
  },
];

const SURFACTANTS: CosmeticSubstance[] = [
  {
    common_name: "Sodium Laureth Sulfate",
    inci_name: "SODIUM LAURETH SULFATE",
    cas_id: "9004-82-4",
    cosmetic_role: ["surfactant"],
    ph_range_min: 5.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Anionic surfactant. Strong foam, effective cleansing. Can be drying. Use at 5-15% in shampoos/cleansers.",
  },
  {
    common_name: "Cocamidopropyl Betaine",
    inci_name: "COCAMIDOPROPYL BETAINE",
    cas_id: "61789-40-0",
    cosmetic_role: ["surfactant"],
    ph_range_min: 4.0,
    ph_range_max: 9.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Amphoteric co-surfactant. Reduces irritation of primary surfactants. Boosts foam. Use at 2-8%.",
  },
  {
    common_name: "Decyl Glucoside",
    inci_name: "DECYL GLUCOSIDE",
    cas_id: "68515-73-1",
    cosmetic_role: ["surfactant"],
    ph_range_min: 4.0,
    ph_range_max: 9.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Mild nonionic glucoside surfactant. APG (Alkyl Polyglucoside) derived from corn and coconut. Baby-safe.",
  },
  {
    common_name: "Coco Glucoside",
    inci_name: "COCO-GLUCOSIDE",
    cas_id: "110615-47-9",
    cosmetic_role: ["surfactant"],
    ph_range_min: 4.0,
    ph_range_max: 9.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Very gentle APG surfactant. Excellent for sensitive and baby formulations. Use at 4-15%.",
  },
  {
    common_name: "Sodium Cocoyl Isethionate",
    inci_name: "SODIUM COCOYL ISETHIONATE",
    cas_id: "61789-32-0",
    cosmetic_role: ["surfactant"],
    ph_range_min: 5.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Ultra-mild anionic surfactant (the 'baby dove' surfactant). Used in syndet bars and gentle cleansers.",
  },
  {
    common_name: "Sodium Lauroyl Sarcosinate",
    inci_name: "SODIUM LAUROYL SARCOSINATE",
    cas_id: "137-16-6",
    molecular_weight: 293.4,
    cosmetic_role: ["surfactant"],
    ph_range_min: 5.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Mild amino acid-based anionic surfactant. Good foaming. Use at 2-10%.",
  },
];

const ACTIVES: CosmeticSubstance[] = [
  {
    common_name: "Niacinamide",
    inci_name: "NIACINAMIDE",
    cas_id: "98-92-0",
    molecular_weight: 122.1,
    cosmetic_role: ["active"],
    ph_range_min: 5.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Vitamin B3. Reduces pores, evens skin tone, strengthens barrier. Stable. Use at 2-10%. Water phase.",
  },
  {
    common_name: "Ascorbic Acid",
    inci_name: "ASCORBIC ACID",
    cas_id: "50-81-7",
    molecular_weight: 176.1,
    cosmetic_role: ["active", "antioxidant"],
    ph_range_min: 2.5,
    ph_range_max: 3.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Pure Vitamin C. Potent antioxidant, brightening, collagen-boosting. Very unstable — requires low pH. Use at 5-20%.",
  },
  {
    common_name: "Retinol",
    inci_name: "RETINOL",
    cas_id: "68-26-8",
    molecular_weight: 286.5,
    cosmetic_role: ["active"],
    ph_range_min: 5.0,
    ph_range_max: 6.5,
    water_solubility: "insoluble",
    domain: "cosmetic",
    description: "Vitamin A. Gold standard anti-aging active. Light and air sensitive. Add to cool-down phase. Use at 0.1-1%.",
  },
  {
    common_name: "Salicylic Acid",
    inci_name: "SALICYLIC ACID",
    cas_id: "69-72-7",
    molecular_weight: 138.1,
    cosmetic_role: ["active"],
    ph_range_min: 3.0,
    ph_range_max: 4.0,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "BHA exfoliant. Oil-soluble — penetrates pores. Anti-acne, anti-inflammatory. Max 2% in EU. Requires low pH to work.",
  },
  {
    common_name: "Glycolic Acid",
    inci_name: "GLYCOLIC ACID",
    cas_id: "79-14-1",
    molecular_weight: 76.1,
    cosmetic_role: ["active", "ph_adjuster"],
    ph_range_min: 3.0,
    ph_range_max: 4.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Smallest AHA. Effective exfoliant and humectant. Requires pH 3-4 to be effective. Use at 5-10%.",
  },
  {
    common_name: "Lactic Acid",
    inci_name: "LACTIC ACID",
    cas_id: "50-21-5",
    molecular_weight: 90.1,
    cosmetic_role: ["active", "ph_adjuster"],
    ph_range_min: 3.0,
    ph_range_max: 5.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Gentle AHA with humectant properties. Also used for pH adjustment. Use at 5-10% for exfoliation.",
  },
  {
    common_name: "Allantoin",
    inci_name: "ALLANTOIN",
    cas_id: "97-59-6",
    molecular_weight: 158.1,
    cosmetic_role: ["active"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "Skin-soothing and wound-healing agent. Must be dissolved in warm water. Use at 0.1-2%.",
  },
  {
    common_name: "Caffeine",
    inci_name: "CAFFEINE",
    cas_id: "58-08-2",
    molecular_weight: 194.2,
    cosmetic_role: ["active"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Vasoconstrictor used in eye creams (reduces puffiness) and cellulite products. Use at 1-5%.",
  },
  {
    common_name: "Alpha-Arbutin",
    inci_name: "ALPHA-ARBUTIN",
    cas_id: "84380-01-8",
    molecular_weight: 272.3,
    cosmetic_role: ["active"],
    ph_range_min: 3.5,
    ph_range_max: 6.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Skin brightening agent that inhibits tyrosinase. Stable. Water-soluble. Use at 0.5-2%.",
  },
  {
    common_name: "Azelaic Acid",
    inci_name: "AZELAIC ACID",
    cas_id: "123-99-9",
    molecular_weight: 188.2,
    cosmetic_role: ["active"],
    ph_range_min: 4.0,
    ph_range_max: 5.0,
    water_solubility: "partially",
    domain: "cosmetic",
    description: "Anti-acne, anti-rosacea, brightening. Needs to be solubilized. Use at 10-20%.",
  },
];

const PH_ADJUSTERS: CosmeticSubstance[] = [
  {
    common_name: "Citric Acid",
    inci_name: "CITRIC ACID",
    cas_id: "77-92-9",
    molecular_weight: 192.1,
    cosmetic_role: ["ph_adjuster", "chelating"],
    ph_range_min: 1.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "both",
    description: "Primary pH-lowering acid for cosmetics. Also chelates metal ions. Add as 10-50% solution.",
  },
  {
    common_name: "Sodium Hydroxide",
    inci_name: "SODIUM HYDROXIDE",
    cas_id: "1310-73-2",
    molecular_weight: 40.0,
    cosmetic_role: ["ph_adjuster"],
    ph_range_min: 12.0,
    ph_range_max: 14.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Strong alkali for pH raising and carbomer neutralization. Always use as dilute solution (10-20%). Handle with care.",
  },
  {
    common_name: "Triethanolamine",
    inci_name: "TRIETHANOLAMINE",
    cas_id: "102-71-6",
    molecular_weight: 149.2,
    cosmetic_role: ["ph_adjuster"],
    ph_range_min: 7.0,
    ph_range_max: 10.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Organic base. Alternative to NaOH for carbomer neutralization. Produces softer gels. Max 2.5% in EU.",
  },
  {
    common_name: "Sodium Lactate",
    inci_name: "SODIUM LACTATE",
    cas_id: "72-17-3",
    molecular_weight: 112.1,
    cosmetic_role: ["humectant", "ph_adjuster"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Part of skin's NMF. Acts as humectant and mild pH buffer. Use at 1-3%.",
  },
];

const CHELATING_AGENTS: CosmeticSubstance[] = [
  {
    common_name: "Disodium EDTA",
    inci_name: "DISODIUM EDTA",
    cas_id: "139-33-3",
    molecular_weight: 336.2,
    cosmetic_role: ["chelating"],
    ph_range_min: 4.0,
    ph_range_max: 8.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Chelates metal ions that degrade preservatives and destabilize emulsions. Use at 0.05-0.2%.",
  },
  {
    common_name: "Sodium Phytate",
    inci_name: "SODIUM PHYTATE",
    cas_id: "14306-25-3",
    cosmetic_role: ["chelating", "antioxidant"],
    ph_range_min: 4.0,
    ph_range_max: 7.0,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Natural alternative to EDTA. Rice-derived chelating agent. Use at 0.05-0.2%.",
  },
];

const SOLVENTS_AND_BASE: CosmeticSubstance[] = [
  {
    common_name: "Water",
    inci_name: "AQUA",
    cas_id: "7732-18-5",
    molecular_weight: 18.0,
    cosmetic_role: ["solvent"],
    ph_range_min: 5.5,
    ph_range_max: 7.5,
    water_solubility: "soluble",
    domain: "both",
    description: "Universal solvent and base of most cosmetic formulations. Use distilled or deionized water.",
  },
  {
    common_name: "Ethanol",
    inci_name: "ALCOHOL DENAT.",
    cas_id: "64-17-5",
    molecular_weight: 46.1,
    cosmetic_role: ["solvent"],
    water_solubility: "soluble",
    domain: "both",
    description: "Solvent for actives and fragrances. Also used as astringent and in toners. Can be drying.",
  },
  {
    common_name: "Witch Hazel Extract",
    inci_name: "HAMAMELIS VIRGINIANA LEAF EXTRACT",
    cas_id: "68916-73-4",
    cosmetic_role: ["solvent", "active"],
    ph_range_min: 3.5,
    ph_range_max: 5.5,
    water_solubility: "soluble",
    domain: "cosmetic",
    description: "Natural astringent and soothing extract. Can partially replace water phase. Use at 5-50%.",
  },
];

// Combine all categories
const ALL_COSMETIC_SUBSTANCES: CosmeticSubstance[] = [
  ...EMULSIFIERS,
  ...OILS_AND_BUTTERS,
  ...WAXES_AND_STRUCTURE,
  ...HUMECTANTS,
  ...SILICONES,
  ...THICKENERS,
  ...PRESERVATIVES,
  ...SURFACTANTS,
  ...ACTIVES,
  ...PH_ADJUSTERS,
  ...CHELATING_AGENTS,
  ...SOLVENTS_AND_BASE,
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🧴 Cosmetic Substances Seed Script`);
  console.log(`   Total substances: ${ALL_COSMETIC_SUBSTANCES.length}`);
  console.log(`   Mode: ${dryRun ? "DRY RUN" : clean ? "CLEAN + INSERT" : "INSERT"}\n`);

  if (clean) {
    if (dryRun) {
      console.log("[DRY-RUN] Would delete all domain='cosmetic' substances\n");
    } else {
      const result = await sql`DELETE FROM substance WHERE domain = 'cosmetic'`;
      console.log(`🗑️  Deleted cosmetic-only substances\n`);
    }
  }

  const stats = { inserted: 0, skipped: 0, errors: 0 };

  for (const sub of ALL_COSMETIC_SUBSTANCES) {
    if (dryRun) {
      console.log(`  [DRY-RUN] ${sub.inci_name} (${sub.common_name}) — roles: ${sub.cosmetic_role.join(", ")}`);
      stats.inserted++;
      continue;
    }

    try {
      // Check if substance already exists (by CAS or by INCI name)
      let existing;
      if (sub.cas_id) {
        existing = await sql`SELECT substance_id FROM substance WHERE cas_id = ${sub.cas_id} LIMIT 1`;
      }
      if ((!existing || existing.length === 0) && sub.inci_name) {
        existing = await sql`SELECT substance_id FROM substance WHERE inci_name = ${sub.inci_name} LIMIT 1`;
      }

      if (existing && existing.length > 0) {
        // Update existing with cosmetic data
        await sql`
          UPDATE substance SET
            inci_name = COALESCE(${sub.inci_name}, inci_name),
            cosmetic_role = ${JSON.stringify(sub.cosmetic_role)}::jsonb,
            hlb_value = COALESCE(${sub.hlb_value ?? null}, hlb_value),
            hlb_required = COALESCE(${sub.hlb_required ?? null}, hlb_required),
            ph_range_min = COALESCE(${sub.ph_range_min ?? null}, ph_range_min),
            ph_range_max = COALESCE(${sub.ph_range_max ?? null}, ph_range_max),
            water_solubility = COALESCE(${sub.water_solubility}, water_solubility),
            description = COALESCE(${sub.description ?? null}, description),
            domain = CASE
              WHEN domain IS NULL OR domain = 'flavor' OR domain = 'fragrance' THEN 'both'
              ELSE domain
            END
          WHERE substance_id = ${existing[0].substance_id}
        `;
        console.log(`  ✏️  Updated: ${sub.common_name} (existing id: ${existing[0].substance_id})`);
        stats.inserted++;
      } else {
        // Insert new
        await sql`
          INSERT INTO substance (
            common_name, inci_name, cas_id, molecular_weight,
            cosmetic_role, hlb_value, hlb_required,
            ph_range_min, ph_range_max, water_solubility,
            domain, description
          ) VALUES (
            ${sub.common_name},
            ${sub.inci_name},
            ${sub.cas_id},
            ${sub.molecular_weight ?? null},
            ${JSON.stringify(sub.cosmetic_role)}::jsonb,
            ${sub.hlb_value ?? null},
            ${sub.hlb_required ?? null},
            ${sub.ph_range_min ?? null},
            ${sub.ph_range_max ?? null},
            ${sub.water_solubility},
            ${sub.domain},
            ${sub.description ?? null}
          )
        `;
        console.log(`  ✅ Inserted: ${sub.common_name}`);
        stats.inserted++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Error with ${sub.common_name}: ${message}`);
      stats.errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${stats.inserted + stats.skipped + stats.errors}`);
  console.log(`   Inserted/Updated: ${stats.inserted}`);
  console.log(`   Skipped: ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log(`\nCategories:`);
  console.log(`   Emulsifiers: ${EMULSIFIERS.length}`);
  console.log(`   Oils & Butters: ${OILS_AND_BUTTERS.length}`);
  console.log(`   Waxes & Structure: ${WAXES_AND_STRUCTURE.length}`);
  console.log(`   Humectants: ${HUMECTANTS.length}`);
  console.log(`   Silicones: ${SILICONES.length}`);
  console.log(`   Thickeners: ${THICKENERS.length}`);
  console.log(`   Preservatives: ${PRESERVATIVES.length}`);
  console.log(`   Surfactants: ${SURFACTANTS.length}`);
  console.log(`   Actives: ${ACTIVES.length}`);
  console.log(`   pH Adjusters: ${PH_ADJUSTERS.length}`);
  console.log(`   Chelating Agents: ${CHELATING_AGENTS.length}`);
  console.log(`   Solvents & Base: ${SOLVENTS_AND_BASE.length}`);
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
