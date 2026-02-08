// Cosmetics domain constants
// Single source of truth for cosmetic-related enum values

// === COSMETIC PHASES ===
export const COSMETIC_PHASE_OPTIONS = [
  { value: "water", label: "Water Phase" },
  { value: "oil", label: "Oil Phase" },
  { value: "cool_down", label: "Cool-Down Phase" },
  { value: "surfactant", label: "Surfactant Phase" },
  { value: "dry", label: "Dry Phase" },
] as const;

export type CosmeticPhaseValue =
  (typeof COSMETIC_PHASE_OPTIONS)[number]["value"];

export const isValidCosmeticPhase = (
  value: string
): value is CosmeticPhaseValue =>
  COSMETIC_PHASE_OPTIONS.some((p) => p.value === value);

// Color mapping for phase badges and borders
export const COSMETIC_PHASE_COLORS: Record<
  CosmeticPhaseValue,
  { bg: string; text: string; border: string; dot: string }
> = {
  water: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  oil: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  cool_down: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-400",
  },
  surfactant: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  dry: {
    bg: "bg-stone-50",
    text: "text-stone-700",
    border: "border-stone-200",
    dot: "bg-stone-400",
  },
};

// === COSMETIC PRODUCT TYPES ===
export const COSMETIC_PRODUCT_TYPE_OPTIONS = [
  { value: "emulsion_ow", label: "Emulsion O/W", description: "Lotion, Cream", icon: "Droplets" },
  { value: "emulsion_wo", label: "Emulsion W/O", description: "Rich Cream, Barrier", icon: "Droplets" },
  { value: "anhydrous", label: "Anhydrous", description: "Balm, Oil Blend", icon: "Flame" },
  { value: "gel", label: "Gel", description: "Serum, Hydrogel", icon: "FlaskConical" },
  { value: "surfactant_based", label: "Surfactant-Based", description: "Cleanser, Shampoo", icon: "Waves" },
  { value: "powder", label: "Powder", description: "Dry Shampoo, Makeup", icon: "Sparkles" },
  { value: "stick", label: "Stick", description: "Lip Balm, Deodorant", icon: "Cylinder" },
] as const;

export type CosmeticProductTypeValue =
  (typeof COSMETIC_PRODUCT_TYPE_OPTIONS)[number]["value"];

export const isValidCosmeticProductType = (
  value: string
): value is CosmeticProductTypeValue =>
  COSMETIC_PRODUCT_TYPE_OPTIONS.some((p) => p.value === value);

// Get label for a product type value
export const getCosmeticProductTypeLabel = (value: string): string => {
  const option = COSMETIC_PRODUCT_TYPE_OPTIONS.find((p) => p.value === value);
  return option ? option.label : value;
};

// === COSMETIC INGREDIENT ROLES ===
export const COSMETIC_ROLE_OPTIONS = [
  { value: "solvent", label: "Solvent" },
  { value: "structure", label: "Structure Agent" },
  { value: "emulsifier", label: "Emulsifier" },
  { value: "preservative", label: "Preservative" },
  { value: "active", label: "Active Ingredient" },
  { value: "sensory", label: "Sensory Modifier" },
  { value: "fragrance", label: "Fragrance" },
  { value: "colorant", label: "Colorant" },
  { value: "humectant", label: "Humectant" },
  { value: "antioxidant", label: "Antioxidant" },
  { value: "chelating", label: "Chelating Agent" },
  { value: "ph_adjuster", label: "pH Adjuster" },
  { value: "surfactant", label: "Surfactant" },
  { value: "thickener", label: "Thickener" },
] as const;

export type CosmeticRoleValue =
  (typeof COSMETIC_ROLE_OPTIONS)[number]["value"];

export const isValidCosmeticRole = (
  value: string
): value is CosmeticRoleValue =>
  COSMETIC_ROLE_OPTIONS.some((r) => r.value === value);

// Color mapping for role badges
export const COSMETIC_ROLE_COLORS: Record<string, string> = {
  solvent: "bg-blue-100 text-blue-700 border-blue-300",
  structure: "bg-stone-100 text-stone-700 border-stone-300",
  emulsifier: "bg-indigo-100 text-indigo-700 border-indigo-300",
  preservative: "bg-red-100 text-red-700 border-red-300",
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  sensory: "bg-pink-100 text-pink-700 border-pink-300",
  fragrance: "bg-violet-100 text-violet-700 border-violet-300",
  colorant: "bg-rose-100 text-rose-700 border-rose-300",
  humectant: "bg-cyan-100 text-cyan-700 border-cyan-300",
  antioxidant: "bg-orange-100 text-orange-700 border-orange-300",
  chelating: "bg-lime-100 text-lime-700 border-lime-300",
  ph_adjuster: "bg-yellow-100 text-yellow-700 border-yellow-300",
  surfactant: "bg-purple-100 text-purple-700 border-purple-300",
  thickener: "bg-amber-100 text-amber-700 border-amber-300",
};

// === PHASES PER PRODUCT TYPE ===
// Determines which phases are relevant for each cosmetic product type
export const PRODUCT_TYPE_PHASES: Record<
  CosmeticProductTypeValue,
  CosmeticPhaseValue[]
> = {
  emulsion_ow: ["water", "oil", "cool_down"],
  emulsion_wo: ["water", "oil", "cool_down"],
  anhydrous: ["oil", "cool_down"],
  gel: ["water", "cool_down"],
  surfactant_based: ["water", "surfactant", "cool_down"],
  powder: ["dry"],
  stick: ["oil", "cool_down"],
};

// === WATER SOLUBILITY OPTIONS ===
export const WATER_SOLUBILITY_OPTIONS = [
  { value: "soluble", label: "Water Soluble" },
  { value: "insoluble", label: "Water Insoluble" },
  { value: "partially", label: "Partially Soluble" },
  { value: "dispersible", label: "Dispersible" },
] as const;

export type WaterSolubilityValue =
  (typeof WATER_SOLUBILITY_OPTIONS)[number]["value"];

// === pH INDICATOR HELPERS ===
export const getPhColor = (
  ph: number | null
): "green" | "yellow" | "red" | "neutral" => {
  if (ph === null) return "neutral";
  if (ph >= 4.5 && ph <= 6) return "green";
  if ((ph >= 3 && ph < 4.5) || (ph > 6 && ph <= 8)) return "yellow";
  return "red";
};

export const PH_COLOR_CLASSES = {
  green: "text-emerald-600 bg-emerald-50 border-emerald-200",
  yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",
  red: "text-red-600 bg-red-50 border-red-200",
  neutral: "text-muted-foreground bg-muted border-border",
} as const;
