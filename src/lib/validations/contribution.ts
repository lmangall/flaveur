import { z } from "zod";
import { FEEDBACK_TYPE_OPTIONS, SUBSTANCE_FIELD_OPTIONS } from "@/constants";

const validFeedbackTypes = FEEDBACK_TYPE_OPTIONS.map((f) => f.value) as [
  string,
  ...string[]
];
const validSubstanceFields = SUBSTANCE_FIELD_OPTIONS.map((f) => f.value) as [
  string,
  ...string[]
];

// ===========================================
// SUBSTANCE SUBMISSION
// ===========================================

export const createSubstanceSchema = z
  .object({
    common_name: z
      .string()
      .min(1, "Common name is required")
      .max(200, "Common name must be less than 200 characters")
      .trim(),

    // At least one identifier required (validated with refine)
    cas_id: z
      .string()
      .max(50, "CAS ID must be less than 50 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    fema_number: z
      .number()
      .int()
      .positive("FEMA number must be a positive integer")
      .optional(),
    pubchem_id: z
      .number()
      .int()
      .positive("PubChem ID must be a positive integer")
      .optional(),

    // At least one sensory property required (validated with refine)
    odor: z
      .string()
      .max(500, "Odor description must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    taste: z
      .string()
      .max(500, "Taste description must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    flavor_profile: z
      .string()
      .max(500, "Flavor profile must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),

    // Additional fields
    iupac_name: z
      .string()
      .max(500, "IUPAC name must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    is_natural: z.boolean().optional(),
    synthetic: z.boolean().optional(),
    molecular_formula: z
      .string()
      .max(100, "Molecular formula must be less than 100 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    molecular_weight: z
      .number()
      .positive("Molecular weight must be positive")
      .optional(),
    smile: z
      .string()
      .max(1000, "SMILES must be less than 1000 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    inchi: z
      .string()
      .max(1000, "InChI must be less than 1000 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    alternative_names: z
      .array(z.string().max(200))
      .max(10, "Maximum 10 alternative names")
      .optional(),
    source_reference: z
      .string()
      .max(500, "Source reference must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => data.cas_id || data.fema_number || data.pubchem_id,
    {
      message:
        "At least one identifier is required: CAS ID, FEMA number, or PubChem ID",
      path: ["cas_id"],
    }
  )
  .refine(
    (data) => data.odor || data.taste || data.flavor_profile,
    {
      message:
        "At least one sensory property is required: odor, taste, or flavor profile",
      path: ["odor"],
    }
  );

export type CreateSubstanceInput = z.infer<typeof createSubstanceSchema>;

// ===========================================
// SUBSTANCE FEEDBACK
// ===========================================

export const createFeedbackSchema = z
  .object({
    substance_id: z.number().int().positive("Substance ID is required"),
    feedback_type: z.enum(validFeedbackTypes, {
      message: "Please select a feedback type",
    }),
    target_field: z.enum(validSubstanceFields).optional(),
    current_value: z
      .string()
      .max(500, "Current value must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    suggested_value: z
      .string()
      .max(500, "Suggested value must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
    commentary: z
      .string()
      .min(10, "Commentary must be at least 10 characters")
      .max(2000, "Commentary must be less than 2000 characters")
      .trim(),
    source_reference: z
      .string()
      .max(500, "Source reference must be less than 500 characters")
      .optional()
      .transform((val) => val?.trim() || undefined),
  })
  .refine(
    (data) => {
      // If it's a change_request with a target_field, require suggested_value
      if (
        data.feedback_type === "change_request" &&
        data.target_field &&
        !data.suggested_value
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Suggested value is required for change requests with a target field",
      path: ["suggested_value"],
    }
  );

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

// ===========================================
// FORM SCHEMAS (client-side)
// ===========================================

export const substanceFormSchema = z.object({
  common_name: z
    .string()
    .min(1, "Common name is required")
    .max(200, "Common name must be less than 200 characters"),
  cas_id: z.string().optional(),
  fema_number: z.string().optional(),
  pubchem_id: z.string().optional(),
  odor: z.string().optional(),
  taste: z.string().optional(),
  flavor_profile: z.string().optional(),
  iupac_name: z.string().optional(),
  description: z.string().optional(),
  is_natural: z.boolean().optional(),
  synthetic: z.boolean().optional(),
  molecular_formula: z.string().optional(),
  molecular_weight: z.string().optional(),
  smile: z.string().optional(),
  inchi: z.string().optional(),
  alternative_names: z.string().optional(), // Comma-separated in form
  source_reference: z.string().optional(),
});

export type SubstanceFormValues = z.infer<typeof substanceFormSchema>;

export const feedbackFormSchema = z.object({
  feedback_type: z.string().min(1, "Please select a feedback type"),
  target_field: z.string().optional(),
  current_value: z.string().optional(),
  suggested_value: z.string().optional(),
  commentary: z.string().min(10, "Commentary must be at least 10 characters"),
  source_reference: z.string().optional(),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
