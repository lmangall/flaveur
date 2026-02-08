// Perfumery domain constants
// Single source of truth for fragrance-related enum values

// === VOLATILITY CLASS ===
export const VOLATILITY_CLASS_OPTIONS = [
  { value: "Head", label: "Top Note (Head)" },
  { value: "Head/Heart", label: "Top-Heart" },
  { value: "Heart", label: "Heart Note" },
  { value: "Heart/Base", label: "Heart-Base" },
  { value: "Base", label: "Base Note" },
] as const;

export type VolatilityClassValue =
  (typeof VOLATILITY_CLASS_OPTIONS)[number]["value"];

export const isValidVolatilityClass = (
  value: string
): value is VolatilityClassValue =>
  VOLATILITY_CLASS_OPTIONS.some((v) => v.value === value);

// Simplified tier for pyramid grouping (Head → top, Heart → heart, Base → base)
export const getVolatilityTier = (
  volatilityClass: string | null
): "top" | "heart" | "base" | null => {
  if (!volatilityClass) return null;
  if (volatilityClass === "Head") return "top";
  if (volatilityClass === "Head/Heart") return "top";
  if (volatilityClass === "Heart") return "heart";
  if (volatilityClass === "Heart/Base") return "base";
  if (volatilityClass === "Base") return "base";
  return null;
};

// === PYRAMID POSITION (manual selection) ===
export const PYRAMID_POSITION_OPTIONS = [
  { value: "top", label: "Top Notes" },
  { value: "heart", label: "Heart Notes" },
  { value: "base", label: "Base Notes" },
] as const;

export type PyramidPositionValue =
  (typeof PYRAMID_POSITION_OPTIONS)[number]["value"];

export const isValidPyramidPosition = (
  value: string
): value is PyramidPositionValue =>
  PYRAMID_POSITION_OPTIONS.some((p) => p.value === value);

// === OLFACTIVE FAMILIES ===
export const OLFACTIVE_FAMILY_OPTIONS = [
  { value: "Aldehydic", label: "Aldehydic" },
  { value: "Amber", label: "Amber" },
  { value: "Animalic", label: "Animalic" },
  { value: "Aromatic", label: "Aromatic" },
  { value: "Balsamic", label: "Balsamic" },
  { value: "Chypre", label: "Chypre" },
  { value: "Citrus", label: "Citrus" },
  { value: "Earthy", label: "Earthy" },
  { value: "Floral", label: "Floral" },
  { value: "Fougère", label: "Fougere" },
  { value: "Fresh", label: "Fresh" },
  { value: "Fruity", label: "Fruity" },
  { value: "Gourmand", label: "Gourmand" },
  { value: "Green", label: "Green" },
  { value: "Herbal", label: "Herbal" },
  { value: "Leather", label: "Leather" },
  { value: "Marine", label: "Marine" },
  { value: "Minty", label: "Minty" },
  { value: "Musk", label: "Musk" },
  { value: "Ozone", label: "Ozone" },
  { value: "Powdery", label: "Powdery" },
  { value: "Smoky", label: "Smoky" },
  { value: "Spicy", label: "Spicy" },
  { value: "Waxy", label: "Waxy" },
  { value: "Woody", label: "Woody" },
] as const;

export type OlfactiveFamilyValue =
  (typeof OLFACTIVE_FAMILY_OPTIONS)[number]["value"];

export const isValidOlfactiveFamily = (
  value: string
): value is OlfactiveFamilyValue =>
  OLFACTIVE_FAMILY_OPTIONS.some((f) => f.value === value);

// Extract primary family from compound value like "Floral; Rose"
export const getPrimaryFamily = (family: string): string =>
  family.split(";")[0].trim();

// Extract sub-family from compound value
export const getSubFamily = (family: string): string | null => {
  const parts = family.split(";");
  return parts.length > 1 ? parts[1].trim() : null;
};

// Color mapping for olfactive family badges
export const OLFACTIVE_FAMILY_COLORS: Record<string, string> = {
  Aldehydic: "bg-slate-100 text-slate-700 border-slate-300",
  Amber: "bg-amber-100 text-amber-700 border-amber-300",
  Animalic: "bg-stone-100 text-stone-700 border-stone-300",
  Aromatic: "bg-teal-100 text-teal-700 border-teal-300",
  Balsamic: "bg-orange-100 text-orange-700 border-orange-300",
  Chypre: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Citrus: "bg-yellow-100 text-yellow-700 border-yellow-300",
  Earthy: "bg-stone-100 text-stone-700 border-stone-300",
  Floral: "bg-pink-100 text-pink-700 border-pink-300",
  Fougère: "bg-lime-100 text-lime-700 border-lime-300",
  Fresh: "bg-cyan-100 text-cyan-700 border-cyan-300",
  Fruity: "bg-red-100 text-red-700 border-red-300",
  Gourmand: "bg-orange-100 text-orange-700 border-orange-300",
  Green: "bg-green-100 text-green-700 border-green-300",
  Herbal: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Leather: "bg-amber-100 text-amber-800 border-amber-400",
  Marine: "bg-sky-100 text-sky-700 border-sky-300",
  Minty: "bg-teal-100 text-teal-700 border-teal-300",
  Musk: "bg-purple-100 text-purple-700 border-purple-300",
  Ozone: "bg-blue-100 text-blue-700 border-blue-300",
  Powdery: "bg-rose-100 text-rose-700 border-rose-300",
  Smoky: "bg-gray-100 text-gray-700 border-gray-300",
  Spicy: "bg-red-100 text-red-800 border-red-400",
  Waxy: "bg-amber-50 text-amber-600 border-amber-200",
  Woody: "bg-amber-100 text-amber-800 border-amber-400",
};

// === PRICE RANGE ===
export const PRICE_RANGE_OPTIONS = [
  { value: "€", label: "€ (Budget)" },
  { value: "€€", label: "€€ (Standard)" },
  { value: "€€€", label: "€€€ (Premium)" },
  { value: "€€€€", label: "€€€€ (High-end)" },
  { value: "€€€€€", label: "€€€€€ (Luxury)" },
] as const;

export type PriceRangeValue = (typeof PRICE_RANGE_OPTIONS)[number]["value"];

// === PERFUME CONCENTRATION TYPES ===
export const PERFUME_CONCENTRATION_OPTIONS = [
  { value: "parfum", label: "Parfum (20-30%)", min: 20, max: 30 },
  { value: "edp", label: "Eau de Parfum (15-20%)", min: 15, max: 20 },
  { value: "edt", label: "Eau de Toilette (5-15%)", min: 5, max: 15 },
  { value: "edc", label: "Eau de Cologne (2-4%)", min: 2, max: 4 },
  { value: "splash", label: "Splash / Body Mist (1-3%)", min: 1, max: 3 },
] as const;

export type PerfumeConcentrationValue =
  (typeof PERFUME_CONCENTRATION_OPTIONS)[number]["value"];

export const isValidPerfumeConcentration = (
  value: string
): value is PerfumeConcentrationValue =>
  PERFUME_CONCENTRATION_OPTIONS.some((c) => c.value === value);

// === PROJECT TYPE ===
export const PROJECT_TYPE_OPTIONS = [
  { value: "flavor", label: "Flavor" },
  { value: "perfume", label: "Perfume" },
  { value: "cosmetic", label: "Cosmetic" },
] as const;

export type ProjectTypeValue =
  (typeof PROJECT_TYPE_OPTIONS)[number]["value"];

export const isValidProjectType = (
  value: string
): value is ProjectTypeValue =>
  PROJECT_TYPE_OPTIONS.some((p) => p.value === value);

// === SUBSTANCE DOMAIN ===
export const SUBSTANCE_DOMAIN_OPTIONS = [
  { value: "flavor", label: "Flavor" },
  { value: "fragrance", label: "Fragrance" },
  { value: "cosmetic", label: "Cosmetic" },
  { value: "both", label: "Both" },
] as const;

export type SubstanceDomainValue =
  (typeof SUBSTANCE_DOMAIN_OPTIONS)[number]["value"];

// === VOLATILITY TIER COLORS (for pyramid) ===
export const VOLATILITY_TIER_COLORS = {
  top: { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" },
  heart: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-300",
  },
  base: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
  },
} as const;
