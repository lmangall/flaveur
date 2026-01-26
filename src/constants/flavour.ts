// Flavour domain constants
// Single source of truth for flavour-related enum values

export const FLAVOUR_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

export type FlavourStatusValue = (typeof FLAVOUR_STATUS_OPTIONS)[number]["value"];

export const isValidFlavourStatus = (value: string): value is FlavourStatusValue =>
  FLAVOUR_STATUS_OPTIONS.some((s) => s.value === value);

export const CONCENTRATION_UNIT_OPTIONS = [
  { value: "g/kg", label: "g/kg" },
  { value: "%(v/v)", label: "%(v/v)" },
  { value: "g/L", label: "g/L" },
  { value: "mL/L", label: "mL/L" },
  { value: "ppm", label: "ppm" },
] as const;

export type ConcentrationUnitValue = (typeof CONCENTRATION_UNIT_OPTIONS)[number]["value"];

export const isValidConcentrationUnit = (value: string): value is ConcentrationUnitValue =>
  CONCENTRATION_UNIT_OPTIONS.some((u) => u.value === value);

// Default values
export const DEFAULT_FLAVOUR_STATUS: FlavourStatusValue = "draft";
export const DEFAULT_BASE_UNIT: ConcentrationUnitValue = "g/kg";
export const DEFAULT_VERSION = 1;

// Variation system constants
export const DEFAULT_VARIATION_LABELS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "Light", label: "Light" },
  { value: "Strong", label: "Strong" },
  { value: "Natural", label: "Natural" },
  { value: "v2", label: "v2" },
] as const;

export type VariationLabelValue =
  | (typeof DEFAULT_VARIATION_LABELS)[number]["value"]
  | string;

export const DEFAULT_IS_MAIN_VARIATION = false;
