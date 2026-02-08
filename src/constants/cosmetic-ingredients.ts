// Cosmetic Ingredients Encyclopedia — static data for the public reference page
// Source: docs/cosmetic-substances-seed.csv (138 substances across 20 categories)

export type CosmeticIngredient = {
  common_name: string;
  inci_name: string;
  cas_id: string | null;
  ci_number: string | null;
  cosmetic_role: string[];
  hlb_value: number | null;
  hlb_required: number | null;
  ph_range_min: number | null;
  ph_range_max: number | null;
  water_solubility: "soluble" | "insoluble" | "partially" | "dispersible" | null;
  use_level_min: number | null;
  use_level_max: number | null;
  uv_coverage: string | null;
  melting_point: number | null;
  domain: "cosmetic" | "both";
  description: string;
};

export type IngredientCategory = {
  key: string;
  label: string;
  labelFr: string;
  icon: string; // lucide icon name
  color: string; // tailwind bg color class
  textColor: string; // tailwind text color class
  borderColor: string; // tailwind border color class
  description: string;
  descriptionFr: string;
  ingredients: CosmeticIngredient[];
};

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  // ─── Emulsifiers ───
  {
    key: "emulsifiers",
    label: "Emulsifiers",
    labelFr: "Émulsifiants",
    icon: "Droplets",
    color: "bg-indigo-50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200",
    description:
      "Emulsifiers allow oil and water to mix into stable creams and lotions. They're classified by HLB (Hydrophilic-Lipophilic Balance) — high HLB (8–18) makes O/W emulsions, low HLB (3–6) makes W/O emulsions.",
    descriptionFr:
      "Les émulsifiants permettent de mélanger huile et eau en crèmes et lotions stables. Ils sont classés par HLB (Balance Hydrophile-Lipophile) — HLB élevé (8–18) pour les émulsions H/E, HLB bas (3–6) pour les émulsions E/H.",
    ingredients: [
      { common_name: "Polysorbate 20", inci_name: "POLYSORBATE 20", cas_id: "9005-64-5", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 16.7, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "O/W emulsifier, solubilizer for essential oils" },
      { common_name: "Polysorbate 60", inci_name: "POLYSORBATE 60", cas_id: "9005-67-8", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 14.9, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "O/W emulsifier for creams and lotions" },
      { common_name: "Polysorbate 80", inci_name: "POLYSORBATE 80", cas_id: "9005-65-6", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 15.0, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Versatile O/W emulsifier, pairs with Span 80" },
      { common_name: "Sorbitan Oleate", inci_name: "SORBITAN OLEATE", cas_id: "1338-43-8", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 4.3, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "W/O emulsifier (Span 80)" },
      { common_name: "Sorbitan Stearate", inci_name: "SORBITAN STEARATE", cas_id: "1338-41-6", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 4.7, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "W/O emulsifier (Span 60)" },
      { common_name: "Glyceryl Stearate", inci_name: "GLYCERYL STEARATE", cas_id: "31566-31-1", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 3.8, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Mild W/O emulsifier + co-emulsifier" },
      { common_name: "Glyceryl Stearate SE", inci_name: "GLYCERYL STEARATE SE", cas_id: "11099-07-3", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 5.8, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Self-emulsifying version" },
      { common_name: "Cetearyl Alcohol + Ceteareth-20", inci_name: "CETEARYL ALCOHOL (AND) CETEARETH-20", cas_id: null, ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 15.2, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Complete emulsifying wax for O/W" },
      { common_name: "Olivem 1000", inci_name: "CETEARYL OLIVATE (AND) SORBITAN OLIVATE", cas_id: null, ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 10.0, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Olive-derived, liquid crystal structures" },
      { common_name: "PEG-40 Hydrogenated Castor Oil", inci_name: "PEG-40 HYDROGENATED CASTOR OIL", cas_id: "61788-85-0", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 15.0, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Solubilizer for fragrances/EOs" },
      { common_name: "Lecithin", inci_name: "LECITHIN", cas_id: "8002-43-5", ci_number: null, cosmetic_role: ["emulsifier"], hlb_value: 7.0, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "dispersible", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural phospholipid, liposome former" },
    ],
  },
  // ─── Oils & Butters ───
  {
    key: "oils_butters",
    label: "Oils & Butters",
    labelFr: "Huiles & Beurres",
    icon: "Leaf",
    color: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    description:
      "Natural and synthetic oils provide emolliency, barrier repair, and skin-feel. Each oil has a Required HLB — the emulsifier HLB needed to properly emulsify it.",
    descriptionFr:
      "Les huiles naturelles et synthétiques apportent émollience, réparation de la barrière cutanée et toucher. Chaque huile a un HLB requis — le HLB de l'émulsifiant nécessaire pour l'émulsionner correctement.",
    ingredients: [
      { common_name: "Sweet Almond Oil", inci_name: "PRUNUS AMYGDALUS DULCIS OIL", cas_id: "8007-69-0", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 7.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Light carrier oil, all skin types" },
      { common_name: "Jojoba Oil", inci_name: "SIMMONDSIA CHINENSIS SEED OIL", cas_id: "61789-91-1", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 6.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Liquid wax ester mimicking sebum, non-comedogenic" },
      { common_name: "Argan Oil", inci_name: "ARGANIA SPINOSA KERNEL OIL", cas_id: "223747-87-1", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 7.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Rich in vitamin E, premium oil" },
      { common_name: "Coconut Oil", inci_name: "COCOS NUCIFERA OIL", cas_id: "8001-31-8", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 8.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Solid <25°C, lauric acid, can be comedogenic" },
      { common_name: "Shea Butter", inci_name: "BUTYROSPERMUM PARKII BUTTER", cas_id: "194043-92-0", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 8.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Rich butter, high unsaponifiables" },
      { common_name: "Cocoa Butter", inci_name: "THEOBROMA CACAO SEED BUTTER", cas_id: "8002-31-1", ci_number: null, cosmetic_role: ["emollient", "structure"], hlb_value: null, hlb_required: 6.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: 34, domain: "cosmetic", description: "Hard butter, melts ~34°C, structure agent" },
      { common_name: "Avocado Oil", inci_name: "PERSEA GRATISSIMA OIL", cas_id: "8024-32-6", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 7.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Rich in oleic acid + phytosterols" },
      { common_name: "Rosehip Seed Oil", inci_name: "ROSA CANINA SEED OIL", cas_id: "84603-93-0", ci_number: null, cosmetic_role: ["emollient", "active"], hlb_value: null, hlb_required: 7.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "High linoleic acid, anti-aging" },
      { common_name: "Castor Oil", inci_name: "RICINUS COMMUNIS SEED OIL", cas_id: "8001-79-4", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 14.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Very viscous, ricinoleic acid, #1 lipstick oil" },
      { common_name: "Sunflower Seed Oil", inci_name: "HELIANTHUS ANNUUS SEED OIL", cas_id: "8001-21-6", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 7.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Light, affordable, high linoleic" },
      { common_name: "Caprylic/Capric Triglyceride", inci_name: "CAPRYLIC/CAPRIC TRIGLYCERIDE", cas_id: "65381-09-1", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Fractionated coconut, non-greasy" },
      { common_name: "Squalane", inci_name: "SQUALANE", cas_id: "111-01-3", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Skin-identical lipid, ultra-light" },
      { common_name: "Isopropyl Myristate", inci_name: "ISOPROPYL MYRISTATE", cas_id: "110-27-0", ci_number: null, cosmetic_role: ["emollient", "sensory"], hlb_value: null, hlb_required: 4.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Fast-absorbing synthetic ester" },
      { common_name: "Mineral Oil", inci_name: "PARAFFINUM LIQUIDUM", cas_id: "8012-95-1", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 10.5, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Excellent occlusive, inert" },
    ],
  },
  // ─── Waxes & Structure ───
  {
    key: "waxes_structure",
    label: "Waxes & Structure Agents",
    labelFr: "Cires & Agents de Structure",
    icon: "Layers",
    color: "bg-stone-50",
    textColor: "text-stone-700",
    borderColor: "border-stone-200",
    description:
      "Waxes provide body, hardness, and structure to sticks, balms, and creams. Melting point determines how firm the final product will be.",
    descriptionFr:
      "Les cires apportent corps, dureté et structure aux sticks, baumes et crèmes. Le point de fusion détermine la fermeté du produit final.",
    ingredients: [
      { common_name: "Beeswax", inci_name: "CERA ALBA", cas_id: "8012-89-3", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: 9.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: 62, domain: "cosmetic", description: "MP 62–65°C, structure + water resistance" },
      { common_name: "Cetyl Alcohol", inci_name: "CETYL ALCOHOL", cas_id: "36653-82-4", ci_number: null, cosmetic_role: ["structure", "emulsifier"], hlb_value: null, hlb_required: 13.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Fatty alcohol thickener + co-emulsifier" },
      { common_name: "Cetearyl Alcohol", inci_name: "CETEARYL ALCOHOL", cas_id: "67762-27-0", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: 13.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Blend of C16/C18 fatty alcohols" },
      { common_name: "Stearic Acid", inci_name: "STEARIC ACID", cas_id: "57-11-4", ci_number: null, cosmetic_role: ["structure", "thickener"], hlb_value: null, hlb_required: 15.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Thickener, hardener, forms soap with alkali" },
      { common_name: "Candelilla Wax", inci_name: "EUPHORBIA CERIFERA WAX", cas_id: "8006-44-8", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: 9.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: 68, domain: "cosmetic", description: "Vegan, MP 68–73°C, glossy" },
      { common_name: "Carnauba Wax", inci_name: "COPERNICIA CERIFERA WAX", cas_id: "8015-86-9", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: 9.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: 82, domain: "cosmetic", description: "Hardest natural wax, MP 82–86°C" },
    ],
  },
  // ─── Humectants ───
  {
    key: "humectants",
    label: "Humectants",
    labelFr: "Humectants",
    icon: "Droplet",
    color: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    description:
      "Humectants attract and hold water in the skin, boosting hydration. They work by drawing moisture from the environment and deeper skin layers to the surface.",
    descriptionFr:
      "Les humectants attirent et retiennent l'eau dans la peau, renforçant l'hydratation. Ils fonctionnent en attirant l'humidité de l'environnement et des couches profondes de la peau vers la surface.",
    ingredients: [
      { common_name: "Glycerin", inci_name: "GLYCERIN", cas_id: "56-81-5", ci_number: null, cosmetic_role: ["humectant"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 8.0, water_solubility: "soluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "both", description: "Most common humectant" },
      { common_name: "Sodium Hyaluronate", inci_name: "SODIUM HYALURONATE", cas_id: "9067-32-7", ci_number: null, cosmetic_role: ["humectant"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 7.5, water_solubility: "soluble", use_level_min: 0.1, use_level_max: 2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Holds 1000x its weight in water" },
      { common_name: "Panthenol", inci_name: "PANTHENOL", cas_id: "81-13-0", ci_number: null, cosmetic_role: ["humectant", "active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 7.0, water_solubility: "soluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "both", description: "Pro-vitamin B5" },
      { common_name: "Propylene Glycol", inci_name: "PROPYLENE GLYCOL", cas_id: "57-55-6", ci_number: null, cosmetic_role: ["humectant", "solvent"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 8.0, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Humectant + penetration enhancer" },
      { common_name: "Butylene Glycol", inci_name: "BUTYLENE GLYCOL", cas_id: "107-88-0", ci_number: null, cosmetic_role: ["humectant", "solvent"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 8.0, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Lighter than PG, less irritating" },
      { common_name: "Urea", inci_name: "UREA", cas_id: "57-13-6", ci_number: null, cosmetic_role: ["humectant", "active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 7.0, water_solubility: "soluble", use_level_min: 5, use_level_max: 40, uv_coverage: null, melting_point: null, domain: "both", description: "5–10% moisturizing, 20–40% exfoliating" },
      { common_name: "Sodium PCA", inci_name: "SODIUM PCA", cas_id: "28874-51-3", ci_number: null, cosmetic_role: ["humectant"], hlb_value: null, hlb_required: null, ph_range_min: 4.5, ph_range_max: 6.5, water_solubility: "soluble", use_level_min: 2, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Part of skin's Natural Moisturizing Factor" },
      { common_name: "Aloe Vera Gel", inci_name: "ALOE BARBADENSIS LEAF JUICE", cas_id: "85507-69-3", ci_number: null, cosmetic_role: ["humectant", "active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 6.0, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Soothing, can replace part of water phase" },
    ],
  },
  // ─── Silicones ───
  {
    key: "silicones",
    label: "Silicones",
    labelFr: "Silicones",
    icon: "Sparkles",
    color: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    description:
      "Silicones create a smooth, non-greasy barrier on the skin. Volatile silicones evaporate leaving a dry-touch feel, while non-volatile ones form lasting protective films.",
    descriptionFr:
      "Les silicones créent une barrière lisse et non grasse sur la peau. Les silicones volatiles s'évaporent en laissant un toucher sec, tandis que les non-volatiles forment des films protecteurs durables.",
    ingredients: [
      { common_name: "Dimethicone", inci_name: "DIMETHICONE", cas_id: "9006-65-9", ci_number: null, cosmetic_role: ["sensory", "emollient"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Most common silicone, non-greasy film" },
      { common_name: "Cyclomethicone", inci_name: "CYCLOPENTASILOXANE", cas_id: "541-02-6", ci_number: null, cosmetic_role: ["sensory", "solvent"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Volatile, evaporates leaving silky feel" },
      { common_name: "Dimethicone Crosspolymer", inci_name: "DIMETHICONE/VINYL DIMETHICONE CROSSPOLYMER", cas_id: "68083-19-2", ci_number: null, cosmetic_role: ["sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Elastomer gel, velvety primer feel" },
      { common_name: "Cetyl Dimethicone", inci_name: "CETYL DIMETHICONE", cas_id: "17955-88-3", ci_number: null, cosmetic_role: ["emulsifier", "sensory"], hlb_value: 2.0, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Waxy silicone W/O emulsifier" },
    ],
  },
  // ─── Thickeners ───
  {
    key: "thickeners",
    label: "Thickeners",
    labelFr: "Épaississants",
    icon: "Waves",
    color: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    description:
      "Thickeners increase viscosity and stabilize formulations. Carbomers require neutralization with a base to gel, while gums and celluloses work across broader pH ranges.",
    descriptionFr:
      "Les épaississants augmentent la viscosité et stabilisent les formulations. Les carbomères nécessitent une neutralisation avec une base pour gélifier, tandis que les gommes et celluloses fonctionnent sur des plages de pH plus larges.",
    ingredients: [
      { common_name: "Carbomer 940", inci_name: "CARBOMER", cas_id: "9003-01-4", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 10.0, water_solubility: "dispersible", use_level_min: 0.1, use_level_max: 0.5, uv_coverage: null, melting_point: null, domain: "both", description: "Must neutralize with NaOH/TEA" },
      { common_name: "Xanthan Gum", inci_name: "XANTHAN GUM", cas_id: "11138-66-2", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 12.0, water_solubility: "soluble", use_level_min: 0.1, use_level_max: 1, uv_coverage: null, melting_point: null, domain: "both", description: "Natural, stable across wide pH" },
      { common_name: "Hydroxyethylcellulose", inci_name: "HYDROXYETHYLCELLULOSE", cas_id: "9004-62-0", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: 2.0, ph_range_max: 12.0, water_solubility: "soluble", use_level_min: 0.5, use_level_max: 2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Nonionic, clear gels" },
      { common_name: "Guar Gum", inci_name: "CYAMOPSIS TETRAGONOLOBA GUM", cas_id: "9000-30-0", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 10.0, water_solubility: "soluble", use_level_min: 0.1, use_level_max: 1, uv_coverage: null, melting_point: null, domain: "both", description: "Natural, hair conditioning" },
      { common_name: "Sodium Polyacrylate", inci_name: "SODIUM POLYACRYLATE", cas_id: "9003-04-7", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 8.0, water_solubility: "dispersible", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Pre-neutralized, no pH adjust needed" },
    ],
  },
  // ─── Preservatives ───
  {
    key: "preservatives",
    label: "Preservatives",
    labelFr: "Conservateurs",
    icon: "ShieldCheck",
    color: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    description:
      "Preservatives prevent microbial growth. Most require specific pH ranges to work — sodium benzoate is only effective below pH 5. EU regulations set maximum allowed concentrations.",
    descriptionFr:
      "Les conservateurs empêchent la croissance microbienne. La plupart nécessitent des plages de pH spécifiques — le benzoate de sodium n'est efficace qu'en dessous de pH 5. La réglementation européenne fixe les concentrations maximales autorisées.",
    ingredients: [
      { common_name: "Phenoxyethanol", inci_name: "PHENOXYETHANOL", cas_id: "122-99-6", ci_number: null, cosmetic_role: ["preservative"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 10.0, water_solubility: null, use_level_min: null, use_level_max: 1, uv_coverage: null, melting_point: null, domain: "both", description: "Broad-spectrum, gram-negative, max 1% EU" },
      { common_name: "Sodium Benzoate", inci_name: "SODIUM BENZOATE", cas_id: "532-32-1", ci_number: null, cosmetic_role: ["preservative"], hlb_value: null, hlb_required: null, ph_range_min: 2.0, ph_range_max: 5.0, water_solubility: null, use_level_min: null, use_level_max: 2.5, uv_coverage: null, melting_point: null, domain: "both", description: "Effective below pH 5, max 2.5% EU" },
      { common_name: "Potassium Sorbate", inci_name: "POTASSIUM SORBATE", cas_id: "24634-61-5", ci_number: null, cosmetic_role: ["preservative"], hlb_value: null, hlb_required: null, ph_range_min: 2.0, ph_range_max: 5.5, water_solubility: null, use_level_min: null, use_level_max: 0.6, uv_coverage: null, melting_point: null, domain: "both", description: "Anti-yeast/mold, pair with Na benzoate, max 0.6% EU" },
      { common_name: "Benzisothiazolinone", inci_name: "BENZISOTHIAZOLINONE", cas_id: "2634-33-5", ci_number: null, cosmetic_role: ["preservative"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 9.0, water_solubility: null, use_level_min: 0.01, use_level_max: 0.05, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Booster, pairs with phenoxyethanol" },
      { common_name: "DHA + Benzyl Alcohol", inci_name: "DEHYDROACETIC ACID (AND) BENZYL ALCOHOL", cas_id: null, ci_number: null, cosmetic_role: ["preservative"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 6.5, water_solubility: null, use_level_min: 0.5, use_level_max: 1, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Popular in natural cosmetics" },
      { common_name: "Tocopherol", inci_name: "TOCOPHEROL", cas_id: "59-02-9", ci_number: null, cosmetic_role: ["antioxidant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: null, use_level_min: 0.05, use_level_max: 0.5, uv_coverage: null, melting_point: null, domain: "both", description: "Vitamin E antioxidant (not a true preservative)" },
    ],
  },
  // ─── Surfactants ───
  {
    key: "surfactants",
    label: "Surfactants",
    labelFr: "Tensioactifs",
    icon: "Wind",
    color: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    description:
      "Surfactants are cleansing and foaming agents. Anionic surfactants are strong cleansers, amphoteric ones reduce irritation, and nonionic APGs are the gentlest choice for sensitive skin.",
    descriptionFr:
      "Les tensioactifs sont des agents nettoyants et moussants. Les anioniques nettoient fortement, les amphotères réduisent l'irritation, et les APG non ioniques sont les plus doux pour les peaux sensibles.",
    ingredients: [
      { common_name: "Sodium Laureth Sulfate", inci_name: "SODIUM LAURETH SULFATE", cas_id: "9004-82-4", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 8.0, water_solubility: null, use_level_min: 5, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Anionic, strong foam, shampoos" },
      { common_name: "Cocamidopropyl Betaine", inci_name: "COCAMIDOPROPYL BETAINE", cas_id: "61789-40-0", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 9.0, water_solubility: null, use_level_min: 2, use_level_max: 8, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Amphoteric, reduces irritation, boosts foam" },
      { common_name: "Decyl Glucoside", inci_name: "DECYL GLUCOSIDE", cas_id: "68515-73-1", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 9.0, water_solubility: null, use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Nonionic, mild APG, baby-safe" },
      { common_name: "Coco Glucoside", inci_name: "COCO-GLUCOSIDE", cas_id: "110615-47-9", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 9.0, water_solubility: null, use_level_min: 4, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Nonionic, very gentle APG" },
      { common_name: "Sodium Cocoyl Isethionate", inci_name: "SODIUM COCOYL ISETHIONATE", cas_id: "61789-32-0", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 7.0, water_solubility: null, use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Anionic, ultra-mild surfactant" },
      { common_name: "Sodium Lauroyl Sarcosinate", inci_name: "SODIUM LAUROYL SARCOSINATE", cas_id: "137-16-6", ci_number: null, cosmetic_role: ["surfactant"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 8.0, water_solubility: null, use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Anionic, amino acid-based" },
    ],
  },
  // ─── Actives ───
  {
    key: "actives",
    label: "Active Ingredients",
    labelFr: "Actifs",
    icon: "Zap",
    color: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    description:
      "Actives deliver targeted skincare benefits — anti-aging, brightening, exfoliation, or acne treatment. Many are pH-sensitive and require careful formulation to remain effective.",
    descriptionFr:
      "Les actifs apportent des bénéfices ciblés — anti-âge, éclaircissement, exfoliation ou traitement de l'acné. Beaucoup sont sensibles au pH et nécessitent une formulation soignée pour rester efficaces.",
    ingredients: [
      { common_name: "Niacinamide", inci_name: "NIACINAMIDE", cas_id: "98-92-0", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 7.0, water_solubility: "soluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Vitamin B3, pores + barrier" },
      { common_name: "Ascorbic Acid", inci_name: "ASCORBIC ACID", cas_id: "50-81-7", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 2.5, ph_range_max: 3.5, water_solubility: "soluble", use_level_min: 5, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Pure Vitamin C, very unstable" },
      { common_name: "Retinol", inci_name: "RETINOL", cas_id: "68-26-8", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 5.0, ph_range_max: 6.5, water_solubility: "insoluble", use_level_min: 0.1, use_level_max: 1, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Vitamin A, light/air sensitive" },
      { common_name: "Salicylic Acid", inci_name: "SALICYLIC ACID", cas_id: "69-72-7", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 4.0, water_solubility: "partially", use_level_min: 0.5, use_level_max: 2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "BHA, oil-soluble, anti-acne" },
      { common_name: "Glycolic Acid", inci_name: "GLYCOLIC ACID", cas_id: "79-14-1", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 4.5, water_solubility: "soluble", use_level_min: 5, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Smallest AHA" },
      { common_name: "Lactic Acid", inci_name: "LACTIC ACID", cas_id: "50-21-5", ci_number: null, cosmetic_role: ["active", "humectant"], hlb_value: null, hlb_required: null, ph_range_min: 3.0, ph_range_max: 5.0, water_solubility: "soluble", use_level_min: 5, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Gentle AHA + humectant" },
      { common_name: "Allantoin", inci_name: "ALLANTOIN", cas_id: "97-59-6", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 7.0, water_solubility: "partially", use_level_min: 0.1, use_level_max: 2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Soothing, wound healing" },
      { common_name: "Caffeine", inci_name: "CAFFEINE", cas_id: "58-08-2", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 7.0, water_solubility: "soluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Vasoconstrictor, eye creams" },
      { common_name: "Alpha-Arbutin", inci_name: "ALPHA-ARBUTIN", cas_id: "84380-01-8", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 3.5, ph_range_max: 6.5, water_solubility: "soluble", use_level_min: 0.5, use_level_max: 2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Skin brightening" },
      { common_name: "Azelaic Acid", inci_name: "AZELAIC ACID", cas_id: "123-99-9", ci_number: null, cosmetic_role: ["active"], hlb_value: null, hlb_required: null, ph_range_min: 4.0, ph_range_max: 5.0, water_solubility: "partially", use_level_min: 10, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Anti-acne, anti-rosacea" },
    ],
  },
  // ─── pH Adjusters ───
  {
    key: "ph_adjusters",
    label: "pH Adjusters",
    labelFr: "Ajusteurs de pH",
    icon: "SlidersHorizontal",
    color: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
    description:
      "pH adjusters fine-tune your formulation's acidity. Most cosmetics target pH 4.5–6.0 (skin's natural range). Citric acid lowers pH; sodium hydroxide raises it.",
    descriptionFr:
      "Les ajusteurs de pH ajustent l'acidité de votre formulation. La plupart des cosmétiques visent un pH de 4,5–6,0 (plage naturelle de la peau). L'acide citrique abaisse le pH ; l'hydroxyde de sodium l'augmente.",
    ingredients: [
      { common_name: "Citric Acid", inci_name: "CITRIC ACID", cas_id: "77-92-9", ci_number: null, cosmetic_role: ["ph_adjuster", "chelating"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Lowers pH, also chelating agent" },
      { common_name: "Sodium Hydroxide", inci_name: "SODIUM HYDROXIDE", cas_id: "1310-73-2", ci_number: null, cosmetic_role: ["ph_adjuster"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Raises pH, neutralizes carbomers, use as 10–20% solution" },
      { common_name: "Triethanolamine", inci_name: "TRIETHANOLAMINE", cas_id: "102-71-6", ci_number: null, cosmetic_role: ["ph_adjuster"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: 2.5, uv_coverage: null, melting_point: null, domain: "both", description: "Alternative to NaOH, softer gels, max 2.5% EU" },
      { common_name: "Sodium Lactate", inci_name: "SODIUM LACTATE", cas_id: "72-17-3", ci_number: null, cosmetic_role: ["ph_adjuster", "humectant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: 1, use_level_max: 3, uv_coverage: null, melting_point: null, domain: "both", description: "Buffer, part of NMF, humectant + pH buffer" },
    ],
  },
  // ─── Chelating Agents ───
  {
    key: "chelating_agents",
    label: "Chelating Agents",
    labelFr: "Agents Chélatants",
    icon: "Link",
    color: "bg-lime-50",
    textColor: "text-lime-700",
    borderColor: "border-lime-200",
    description:
      "Chelating agents bind trace metal ions that can destabilize emulsions and deactivate preservatives. Used at very low levels (0.05–0.2%) but critical for shelf stability.",
    descriptionFr:
      "Les agents chélatants lient les ions métalliques traces qui peuvent déstabiliser les émulsions et désactiver les conservateurs. Utilisés à très faible dose (0,05–0,2%) mais essentiels pour la stabilité.",
    ingredients: [
      { common_name: "Disodium EDTA", inci_name: "DISODIUM EDTA", cas_id: "139-33-3", ci_number: null, cosmetic_role: ["chelating"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: 0.05, use_level_max: 0.2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Chelates metal ions, protects preservatives" },
      { common_name: "Sodium Phytate", inci_name: "SODIUM PHYTATE", cas_id: "14306-25-3", ci_number: null, cosmetic_role: ["chelating"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: 0.05, use_level_max: 0.2, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural EDTA alternative, rice-derived" },
    ],
  },
  // ─── Solvents & Base ───
  {
    key: "solvents_base",
    label: "Solvents & Base",
    labelFr: "Solvants & Base",
    icon: "Beaker",
    color: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    description:
      "The vehicle of every water-based cosmetic. Always use distilled or deionized water. Ethanol serves as solvent and astringent; botanical extracts can replace part of the water phase.",
    descriptionFr:
      "Le véhicule de tout cosmétique à base d'eau. Toujours utiliser de l'eau distillée ou déionisée. L'éthanol sert de solvant et astringent ; les extraits botaniques peuvent remplacer une partie de la phase aqueuse.",
    ingredients: [
      { common_name: "Water", inci_name: "AQUA", cas_id: "7732-18-5", ci_number: null, cosmetic_role: ["solvent"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Use distilled or deionized" },
      { common_name: "Ethanol", inci_name: "ALCOHOL DENAT.", cas_id: "64-17-5", ci_number: null, cosmetic_role: ["solvent"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Solvent, astringent, can be drying" },
      { common_name: "Witch Hazel Extract", inci_name: "HAMAMELIS VIRGINIANA LEAF EXTRACT", cas_id: "68916-73-4", ci_number: null, cosmetic_role: ["solvent", "active"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "both", description: "Natural astringent, can replace part of water phase" },
    ],
  },
  // ─── Colorants & Pigments ───
  {
    key: "colorants_pigments",
    label: "Colorants & Pigments",
    labelFr: "Colorants & Pigments",
    icon: "Palette",
    color: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
    description:
      "Pigments provide color to foundations, eyeshadows, lipsticks, and blush. Iron oxides are the backbone of complexion products. Micas add pearlescence and shimmer. All are identified by CI (Colour Index) numbers.",
    descriptionFr:
      "Les pigments donnent la couleur aux fonds de teint, fards à paupières, rouges à lèvres et blush. Les oxydes de fer sont la base des produits de teint. Les micas ajoutent la nacre et le scintillement. Tous sont identifiés par des numéros CI (Colour Index).",
    ingredients: [
      { common_name: "Iron Oxide Yellow", inci_name: "IRON OXIDES", cas_id: "51274-00-1", ci_number: "CI 77492", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Warm yellow pigment, foundation/concealer base" },
      { common_name: "Iron Oxide Red", inci_name: "IRON OXIDES", cas_id: "1309-37-1", ci_number: "CI 77491", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Red-brown pigment, foundation/blush/lipstick" },
      { common_name: "Iron Oxide Black", inci_name: "IRON OXIDES", cas_id: "1317-61-9", ci_number: "CI 77499", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.1, use_level_max: 3, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Black pigment, eyeliner/mascara/shade adjustment" },
      { common_name: "Titanium Dioxide", inci_name: "TITANIUM DIOXIDE", cas_id: "13463-67-7", ci_number: "CI 77891", cosmetic_role: ["colorant", "uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 25, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "White pigment + UV filter + opacity in foundations" },
      { common_name: "Zinc Oxide", inci_name: "ZINC OXIDE", cas_id: "1314-13-2", ci_number: "CI 77947", cosmetic_role: ["colorant", "uv_filter", "active"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 25, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "White pigment + UV filter + mattifying, calming" },
      { common_name: "Mica", inci_name: "MICA", cas_id: "12001-26-2", ci_number: "CI 77019", cosmetic_role: ["colorant", "sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 40, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Pearlescent base, slip agent, shimmer in eyeshadow/highlighter" },
      { common_name: "Ultramarine Blue", inci_name: "ULTRAMARINES", cas_id: "57455-37-5", ci_number: "CI 77007", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Vivid blue, eyeshadow, color correctors" },
      { common_name: "Ultramarine Violet", inci_name: "ULTRAMARINES", cas_id: "12769-96-9", ci_number: "CI 77007", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Purple shade, eyeshadow, blush toning" },
      { common_name: "Chromium Oxide Green", inci_name: "CHROMIUM OXIDE GREENS", cas_id: "1308-38-9", ci_number: "CI 77288", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Stable matte green, eyeshadow" },
      { common_name: "Carmine", inci_name: "CARMINE", cas_id: "1390-65-4", ci_number: "CI 75470", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "partially", use_level_min: 0.5, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural red from cochineal, lipstick staple" },
      { common_name: "D&C Red No. 7 Ca Lake", inci_name: "D&C RED NO. 7 CALCIUM LAKE", cas_id: "5281-04-9", ci_number: "CI 15850:1", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 3, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Lip-safe red lake pigment" },
      { common_name: "FD&C Yellow No. 5 Al Lake", inci_name: "FD&C YELLOW NO. 5 ALUMINUM LAKE", cas_id: "12225-21-7", ci_number: "CI 19140:1", cosmetic_role: ["colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 0.5, use_level_max: 3, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Yellow lake for color cosmetics" },
    ],
  },
  // ─── Powder Fillers & Binders ───
  {
    key: "powder_fillers",
    label: "Powder Fillers & Binders",
    labelFr: "Charges & Liants en Poudre",
    icon: "CircleDot",
    color: "bg-stone-50",
    textColor: "text-stone-700",
    borderColor: "border-stone-200",
    description:
      "Powders provide bulk, oil absorption, and skin-feel in pressed products, foundations, and dry shampoos. Binders like magnesium stearate hold pressed powders together, while spherical powders (nylon-12, boron nitride) give a blur/soft-focus effect.",
    descriptionFr:
      "Les poudres apportent du volume, de l'absorption d'huile et du toucher dans les poudres pressées, fonds de teint et shampoings secs. Les liants comme le stéarate de magnésium maintiennent les poudres compactes, tandis que les poudres sphériques (nylon-12, nitrure de bore) donnent un effet flou/focus doux.",
    ingredients: [
      { common_name: "Talc", inci_name: "TALC", cas_id: "14807-96-6", ci_number: null, cosmetic_role: ["sensory", "structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 10, use_level_max: 80, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Classic filler, slip agent, bulk in pressed powders" },
      { common_name: "Kaolin", inci_name: "KAOLIN", cas_id: "1332-58-7", ci_number: null, cosmetic_role: ["structure", "active"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 30, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Oil-absorbing clay, mattifying, binder for pressed powders" },
      { common_name: "Silica (Amorphous)", inci_name: "SILICA", cas_id: "7631-86-9", ci_number: null, cosmetic_role: ["sensory", "structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Mattifying microspheres, oil absorption, soft-focus" },
      { common_name: "Magnesium Stearate", inci_name: "MAGNESIUM STEARATE", cas_id: "557-04-0", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Binder/lubricant for pressed powders, adhesion" },
      { common_name: "Zinc Stearate", inci_name: "ZINC STEARATE", cas_id: "557-05-1", ci_number: null, cosmetic_role: ["structure", "sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Adhesion promoter, skin-feel modifier, compressibility" },
      { common_name: "Calcium Carbonate", inci_name: "CALCIUM CARBONATE", cas_id: "471-34-1", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 30, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Cheap filler, mild abrasive, opacity" },
      { common_name: "Nylon-12", inci_name: "NYLON-12", cas_id: "24937-16-4", ci_number: null, cosmetic_role: ["sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Spherical powder, silky texture, blur/soft-focus effect" },
      { common_name: "Boron Nitride", inci_name: "BORON NITRIDE", cas_id: "10043-11-5", ci_number: null, cosmetic_role: ["sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Ultra-luxe slip agent, soft focus, satin finish" },
      { common_name: "Rice Starch", inci_name: "ORYZA SATIVA STARCH", cas_id: "9005-25-8", ci_number: null, cosmetic_role: ["structure", "sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural oil absorber, mattifying, dry shampoo" },
      { common_name: "Sericite", inci_name: "SERICITE", cas_id: "12001-26-2", ci_number: null, cosmetic_role: ["sensory", "structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 30, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Fine-grade mica, superior adhesion in foundations" },
    ],
  },
  // ─── Lip & Stick Ingredients ───
  {
    key: "lip_stick",
    label: "Lip & Stick Ingredients",
    labelFr: "Ingrédients Lèvres & Sticks",
    icon: "Cylinder",
    color: "bg-fuchsia-50",
    textColor: "text-fuchsia-700",
    borderColor: "border-fuchsia-200",
    description:
      "Specialized ingredients for lipsticks, lip glosses, lip balms, and deodorant sticks. Mineral waxes (ozokerite, ceresin) provide stick structure, while polybutene and bis-diglyceryl adipate create gloss and cushion.",
    descriptionFr:
      "Ingrédients spécialisés pour rouges à lèvres, gloss, baumes à lèvres et déodorants en stick. Les cires minérales (ozokérite, cérésine) apportent la structure, tandis que le polybutène et le bis-diglycéryl adipate créent le brillant et le confort.",
    ingredients: [
      { common_name: "Ozokerite", inci_name: "OZOKERITE", cas_id: "12198-93-5", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 15, uv_coverage: null, melting_point: 58, domain: "cosmetic", description: "Mineral wax, key lipstick structure agent, MP 58–70°C" },
      { common_name: "Microcrystalline Wax", inci_name: "CERA MICROCRISTALLINA", cas_id: "63231-60-7", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Flexible structure, prevents sweating/blooming in sticks" },
      { common_name: "Ceresin", inci_name: "CERESIN", cas_id: "8001-75-0", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Purified ozokerite, smooth stick structure" },
      { common_name: "Lanolin", inci_name: "LANOLIN", cas_id: "8006-54-0", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Skin-identical lipid, superb lip emollient, occlusive" },
      { common_name: "Polybutene", inci_name: "POLYBUTENE", cas_id: "9003-29-6", ci_number: null, cosmetic_role: ["sensory", "thickener"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 30, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Glossy viscosity builder in lip glosses" },
      { common_name: "Hydrogenated Polyisobutene", inci_name: "HYDROGENATED POLYISOBUTENE", cas_id: "68937-10-0", ci_number: null, cosmetic_role: ["sensory", "emollient"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 25, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Non-tacky gloss agent, occlusive film" },
      { common_name: "Diisostearyl Malate", inci_name: "DIISOSTEARYL MALATE", cas_id: "70969-70-9", ci_number: null, cosmetic_role: ["sensory", "emollient"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 25, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Long-wear pigment binder in lipstick" },
      { common_name: "Octyldodecanol", inci_name: "OCTYLDODECANOL", cas_id: "5333-42-6", ci_number: null, cosmetic_role: ["emollient", "sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Emollient + excellent pigment dispersant" },
      { common_name: "Bis-Diglyceryl Polyacyladipate-2", inci_name: "BIS-DIGLYCERYL POLYACYLADIPATE-2", cas_id: "126928-07-2", ci_number: null, cosmetic_role: ["emollient", "sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 10, use_level_max: 40, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Glossy, non-sticky emollient for lip oils" },
    ],
  },
  // ─── Film Formers & Fixatives ───
  {
    key: "film_formers",
    label: "Film Formers & Fixatives",
    labelFr: "Filmogènes & Fixateurs",
    icon: "Shield",
    color: "bg-teal-50",
    textColor: "text-teal-700",
    borderColor: "border-teal-200",
    description:
      "Film formers create continuous flexible or rigid films on skin/hair. They deliver long-wear properties in mascara, waterproof sunscreen, and hold in hair styling products.",
    descriptionFr:
      "Les filmogènes créent des films continus flexibles ou rigides sur la peau/les cheveux. Ils apportent la tenue longue durée au mascara, la protection solaire waterproof et la fixation aux produits coiffants.",
    ingredients: [
      { common_name: "VP/VA Copolymer", inci_name: "VP/VA COPOLYMER", cas_id: "25086-89-9", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Hair fixative, styling hold, film former" },
      { common_name: "PVP", inci_name: "PVP", cas_id: "9003-39-8", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "soluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Film former, hair styling, adhesion" },
      { common_name: "Acrylates Copolymer", inci_name: "ACRYLATES COPOLYMER", cas_id: "25133-97-5", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "dispersible", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Waterproof film, mascara, sunscreen, long-wear" },
      { common_name: "Acrylates/Octylacrylamide Copolymer", inci_name: "ACRYLATES/OCTYLACRYLAMIDE COPOLYMER", cas_id: "65033-31-6", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Water-resistant film for mascara, sun care" },
      { common_name: "Shellac", inci_name: "SHELLAC", cas_id: "9000-59-3", ci_number: null, cosmetic_role: ["structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural resin film former, mascara, nail" },
    ],
  },
  // ─── UV Filters ───
  {
    key: "uv_filters",
    label: "UV Filters",
    labelFr: "Filtres UV",
    icon: "Sun",
    color: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    description:
      "UV filters absorb or scatter UV radiation to protect skin. Mineral filters (zinc oxide, titanium dioxide) scatter light; chemical filters absorb specific wavelengths. Broad-spectrum protection requires both UVA and UVB coverage.",
    descriptionFr:
      "Les filtres UV absorbent ou diffusent le rayonnement UV pour protéger la peau. Les filtres minéraux (oxyde de zinc, dioxyde de titane) diffusent la lumière ; les filtres chimiques absorbent des longueurs d'onde spécifiques. Une protection large spectre nécessite une couverture UVA et UVB.",
    ingredients: [
      { common_name: "Zinc Oxide (nano)", inci_name: "ZINC OXIDE", cas_id: "1314-13-2", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 25, uv_coverage: "broad", melting_point: null, domain: "cosmetic", description: "Mineral filter, also pigment, reef-safer" },
      { common_name: "Titanium Dioxide (nano)", inci_name: "TITANIUM DIOXIDE", cas_id: "13463-67-7", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 25, uv_coverage: "UVB+UVA2", melting_point: null, domain: "cosmetic", description: "Mineral filter, white cast concern" },
      { common_name: "Avobenzone", inci_name: "BUTYL METHOXYDIBENZOYLMETHANE", cas_id: "70356-09-1", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 3, uv_coverage: "UVA1", melting_point: null, domain: "cosmetic", description: "Key UVA filter, photo-unstable alone" },
      { common_name: "Homosalate", inci_name: "HOMOSALATE", cas_id: "118-56-9", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 10, uv_coverage: "UVB", melting_point: null, domain: "cosmetic", description: "Common UVB filter, solvent properties" },
      { common_name: "Octinoxate", inci_name: "ETHYLHEXYL METHOXYCINNAMATE", cas_id: "5466-77-3", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 10, uv_coverage: "UVB", melting_point: null, domain: "cosmetic", description: "Widely used UVB filter, eco concerns" },
      { common_name: "Octocrylene", inci_name: "OCTOCRYLENE", cas_id: "6197-30-4", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 10, uv_coverage: "UVB", melting_point: null, domain: "cosmetic", description: "Photostabilizes avobenzone, film former" },
      { common_name: "Tinosorb S", inci_name: "BIS-ETHYLHEXYLOXYPHENOL METHOXYPHENYL TRIAZINE", cas_id: "187393-00-6", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 10, uv_coverage: "broad", melting_point: null, domain: "cosmetic", description: "Oil-soluble broad-spectrum, photostable" },
      { common_name: "Tinosorb M", inci_name: "METHYLENE BIS-BENZOTRIAZOLYL TETRAMETHYLBUTYLPHENOL", cas_id: "103597-45-1", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "dispersible", use_level_min: null, use_level_max: 10, uv_coverage: "broad", melting_point: null, domain: "cosmetic", description: "Particulate UV filter, boosts SPF synergistically" },
      { common_name: "Uvinul A Plus", inci_name: "DIETHYLAMINO HYDROXYBENZOYL HEXYL BENZOATE", cas_id: "302776-68-7", ci_number: null, cosmetic_role: ["uv_filter"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: 10, uv_coverage: "UVA", melting_point: null, domain: "cosmetic", description: "Photostable UVA filter, oil-soluble" },
    ],
  },
  // ─── Emollients & Esters ───
  {
    key: "emollients_esters",
    label: "Emollients & Esters",
    labelFr: "Émollients & Esters",
    icon: "Milk",
    color: "bg-sky-50",
    textColor: "text-sky-700",
    borderColor: "border-sky-200",
    description:
      "Lightweight synthetic esters that provide specific skin-feel without the heaviness of natural oils. They serve as spreading agents, pigment wetters, and SPF boosters in modern formulations.",
    descriptionFr:
      "Esters synthétiques légers qui offrent un toucher spécifique sans la lourdeur des huiles naturelles. Ils servent d'agents d'étalement, de mouillants pour pigments et de boosters de SPF dans les formulations modernes.",
    ingredients: [
      { common_name: "Cetyl Ethylhexanoate", inci_name: "CETYL ETHYLHEXANOATE", cas_id: "59130-69-7", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Lightweight dry-touch ester, fast absorption" },
      { common_name: "Coco-Caprylate", inci_name: "COCO-CAPRYLATE", cas_id: "95912-87-1", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Natural-derived, dry non-greasy feel" },
      { common_name: "Dicaprylyl Carbonate", inci_name: "DICAPRYLYL CARBONATE", cas_id: "1680-31-5", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Ultra-light, volatile-feeling, spreadability" },
      { common_name: "Ethylhexyl Palmitate", inci_name: "ETHYLHEXYL PALMITATE", cas_id: "29806-73-3", ci_number: null, cosmetic_role: ["emollient", "sensory"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Spreading agent, pigment dispersant in makeup" },
      { common_name: "C12-15 Alkyl Benzoate", inci_name: "C12-15 ALKYL BENZOATE", cas_id: "68411-27-8", ci_number: null, cosmetic_role: ["emollient"], hlb_value: null, hlb_required: 5.0, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "SPF booster, emollient, good pigment wetter" },
      { common_name: "Isododecane", inci_name: "ISODODECANE", cas_id: "31807-55-3", ci_number: null, cosmetic_role: ["emollient", "solvent"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: null, use_level_max: null, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Volatile emollient, dry quick-evap feel, foundation/mascara carrier" },
    ],
  },
  // ─── Oil-Phase Rheology Modifiers ───
  {
    key: "oil_rheology",
    label: "Oil-Phase Rheology Modifiers",
    labelFr: "Modificateurs Rhéologiques Phase Huileuse",
    icon: "FlaskConical",
    color: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
    description:
      "Organoclays and modified silicas that thicken and gel oil phases. Essential for suspending pigments in lipstick, mascara, and other anhydrous color cosmetics.",
    descriptionFr:
      "Organo-argiles et silices modifiées qui épaississent et gélifient les phases huileuses. Essentiels pour suspendre les pigments dans les rouges à lèvres, mascaras et autres cosmétiques colorés anhydres.",
    ingredients: [
      { common_name: "Stearalkonium Hectorite", inci_name: "STEARALKONIUM HECTORITE", cas_id: "12691-60-0", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 4, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Organoclay, thickens/gels oils, suspends pigments (Bentone Gel)" },
      { common_name: "Silica Silylate", inci_name: "SILICA SILYLATE", cas_id: "68909-20-6", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 5, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Thickens oils into gel texture, stabilizes emulsions" },
      { common_name: "Disteardimonium Hectorite", inci_name: "DISTEARDIMONIUM HECTORITE", cas_id: "68153-33-9", ci_number: null, cosmetic_role: ["thickener"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 4, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Organoclay for anhydrous systems, lipstick/mascara structure" },
    ],
  },
  // ─── Sensory Modifiers ───
  {
    key: "sensory_modifiers",
    label: "Sensory Modifiers",
    labelFr: "Modificateurs Sensoriels",
    icon: "Hand",
    color: "bg-pink-50",
    textColor: "text-pink-700",
    borderColor: "border-pink-200",
    description:
      "Sensory modifiers tune the feel, finish, and visual effect of cosmetics. Silicone microspheres blur pores, lauroyl lysine gives silky slip, and glass flakes create shimmer and glitter.",
    descriptionFr:
      "Les modificateurs sensoriels ajustent le toucher, le fini et l'effet visuel des cosmétiques. Les microsphères de silicone floutent les pores, le lauroyl lysine donne un toucher soyeux, et les paillettes de verre créent le scintillement.",
    ingredients: [
      { common_name: "Polymethylsilsesquioxane", inci_name: "POLYMETHYLSILSESQUIOXANE", cas_id: "68554-70-1", ci_number: null, cosmetic_role: ["sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Silicone microspheres, soft-focus blur, velvety feel" },
      { common_name: "Lauroyl Lysine", inci_name: "LAUROYL LYSINE", cas_id: "52315-75-0", ci_number: null, cosmetic_role: ["sensory"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Amino acid powder, skin adhesion, silky slip in powders" },
      { common_name: "Ethylhexyl Hydroxystearate", inci_name: "ETHYLHEXYL HYDROXYSTEARATE", cas_id: "29710-25-6", ci_number: null, cosmetic_role: ["sensory", "emollient"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 5, use_level_max: 20, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Cushiony feel in lip products, pigment wetter" },
      { common_name: "Trimethylsiloxysilicate", inci_name: "TRIMETHYLSILOXYSILICATE", cas_id: "56275-01-5", ci_number: null, cosmetic_role: ["sensory", "structure"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 2, use_level_max: 10, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Silicone resin, long-wear adhesion, transfer resistance" },
      { common_name: "Calcium Aluminum Borosilicate", inci_name: "CALCIUM ALUMINUM BOROSILICATE", cas_id: "65997-17-3", ci_number: null, cosmetic_role: ["sensory", "colorant"], hlb_value: null, hlb_required: null, ph_range_min: null, ph_range_max: null, water_solubility: "insoluble", use_level_min: 1, use_level_max: 15, uv_coverage: null, melting_point: null, domain: "cosmetic", description: "Glass flake base for shimmer/glitter effects" },
    ],
  },
];

// ─── Helper functions ───

/** Get total ingredient count across all categories */
export const getTotalIngredientCount = (): number =>
  INGREDIENT_CATEGORIES.reduce((sum, cat) => sum + cat.ingredients.length, 0);

/** Get a flat list of all ingredients */
export const getAllIngredients = (): CosmeticIngredient[] =>
  INGREDIENT_CATEGORIES.flatMap((cat) => cat.ingredients);

/** Search ingredients by name or INCI */
export const searchIngredients = (
  query: string
): { category: IngredientCategory; ingredient: CosmeticIngredient }[] => {
  const q = query.toLowerCase();
  const results: { category: IngredientCategory; ingredient: CosmeticIngredient }[] = [];
  for (const cat of INGREDIENT_CATEGORIES) {
    for (const ing of cat.ingredients) {
      if (
        ing.common_name.toLowerCase().includes(q) ||
        ing.inci_name.toLowerCase().includes(q) ||
        (ing.cas_id && ing.cas_id.includes(q)) ||
        (ing.ci_number && ing.ci_number.toLowerCase().includes(q))
      ) {
        results.push({ category: cat, ingredient: ing });
      }
    }
  }
  return results;
};
