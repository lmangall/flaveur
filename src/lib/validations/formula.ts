import { z } from "zod";
import { CONCENTRATION_UNIT_OPTIONS, FORMULA_STATUS_OPTIONS, PROJECT_TYPE_OPTIONS, PYRAMID_POSITION_OPTIONS, COSMETIC_PRODUCT_TYPE_OPTIONS, COSMETIC_PHASE_OPTIONS } from "@/constants";

// Extract valid values from constants
const validUnits = CONCENTRATION_UNIT_OPTIONS.map((u) => u.value) as [string, ...string[]];
const validStatuses = FORMULA_STATUS_OPTIONS.map((s) => s.value) as [string, ...string[]];
const validProjectTypes = PROJECT_TYPE_OPTIONS.map((p) => p.value) as [string, ...string[]];
const validPyramidPositions = PYRAMID_POSITION_OPTIONS.map((p) => p.value) as [string, ...string[]];
const validCosmeticProductTypes = COSMETIC_PRODUCT_TYPE_OPTIONS.map((p) => p.value) as [string, ...string[]];
const validCosmeticPhases = COSMETIC_PHASE_OPTIONS.map((p) => p.value) as [string, ...string[]];

// Substance in a formula schema
export const substanceInFormulaSchema = z.object({
  fema_number: z.number().int().positive("FEMA number must be a positive integer"),
  concentration: z.number().positive("Concentration must be positive"),
  unit: z.enum(validUnits, { message: "Please select a valid unit" }),
  order_index: z.number().int().min(0),
  supplier: z.string().max(100).optional().nullable(),
  dilution: z.string().max(50).optional().nullable(),
  price_per_kg: z.number().positive().optional().nullable(),
  pyramid_position: z.enum(validPyramidPositions).optional().nullable(),
  phase: z.enum(validCosmeticPhases).optional().nullable(),
});

export type SubstanceInFormulaInput = z.infer<typeof substanceInFormulaSchema>;

// Create formula schema
export const createFormulaSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .transform((val) => val?.trim() || null),
  notes: z
    .string()
    .max(10000, "Notes must be less than 10000 characters")
    .nullable()
    .optional()
    .transform((val) => val?.trim() || null),
  is_public: z.boolean().default(false),
  category_id: z.number().int().positive().nullable().optional(),
  status: z.enum(validStatuses).default("draft"),
  base_unit: z.enum(validUnits).default("g/kg"),
  project_type: z.enum(validProjectTypes).default("flavor"),
  cosmetic_product_type: z.enum(validCosmeticProductTypes).optional().nullable(),
  target_ph: z.number().min(0).max(14).optional().nullable(),
  preservative_system: z.string().max(500).optional().nullable(),
  manufacturing_notes: z.string().max(10000).optional().nullable(),
  substances: z.array(substanceInFormulaSchema).optional().default([]),
});

export type CreateFormulaInput = z.infer<typeof createFormulaSchema>;

// Update formula schema (all fields optional except id)
// Note: description and notes use nullable() to distinguish between:
// - undefined: field not provided, keep existing value
// - null or "": explicitly cleared, set to null
// - string: set to that value
export const updateFormulaSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .nullable()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined; // Not provided, keep existing
      if (val === null || val.trim() === "") return null; // Explicitly cleared
      return val.trim(); // Has value
    }),
  notes: z
    .string()
    .max(10000, "Notes must be less than 10000 characters")
    .nullable()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined; // Not provided, keep existing
      if (val === null || val.trim() === "") return null; // Explicitly cleared
      return val.trim(); // Has value
    }),
  is_public: z.boolean().optional(),
  category_id: z.number().int().positive().nullable().optional(),
  status: z.enum(validStatuses).optional(),
  base_unit: z.enum(validUnits).optional(),
  project_type: z.enum(validProjectTypes).optional(),
  cosmetic_product_type: z.enum(validCosmeticProductTypes).optional().nullable(),
  target_ph: z.number().min(0).max(14).optional().nullable(),
  preservative_system: z.string().max(500).optional().nullable(),
  manufacturing_notes: z.string().max(10000).optional().nullable(),
});

export type UpdateFormulaInput = z.infer<typeof updateFormulaSchema>;

// Client-side form validation schema (before transformation)
export const formulaFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
  status: z.string().default("draft"),
  baseUnit: z.string().default("g/kg"),
});

export type FormulaFormValues = z.infer<typeof formulaFormSchema>;

// Validate a single substance entry in the form
export const substanceFormEntrySchema = z.object({
  substance_id: z.string().min(1, "Substance is required"),
  concentration: z
    .string()
    .min(1, "Concentration is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Concentration must be a positive number",
    }),
  unit: z.enum(validUnits, { message: "Please select a valid unit" }),
  supplier: z.string().max(100).optional(),
  dilution: z.string().max(50).optional(),
  price_per_kg: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
      message: "Price must be a positive number",
    }),
  pyramid_position: z.enum(validPyramidPositions).optional().nullable(),
  phase: z.enum(validCosmeticPhases).optional().nullable(),
});

export type SubstanceFormEntry = z.infer<typeof substanceFormEntrySchema>;
