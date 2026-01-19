import { z } from "zod";

// Job alert preferences schema
export const jobAlertPreferencesSchema = z.object({
  locations: z
    .array(z.string().max(100))
    .max(10, "Maximum 10 locations allowed")
    .optional()
    .default([]),
  employmentTypes: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 employment types allowed")
    .optional()
    .default([]),
  experienceLevels: z
    .array(z.string().max(50))
    .max(5, "Maximum 5 experience levels allowed")
    .optional()
    .default([]),
  keywords: z
    .array(z.string().max(100))
    .max(10, "Maximum 10 keywords allowed")
    .optional()
    .default([]),
  frequency: z
    .enum(["instant", "daily", "weekly"])
    .default("daily"),
  isActive: z
    .boolean()
    .default(true),
});

export type JobAlertPreferencesInput = z.infer<typeof jobAlertPreferencesSchema>;

// Schema for updating just the active status
export const jobAlertToggleSchema = z.object({
  isActive: z.boolean(),
});

export type JobAlertToggleInput = z.infer<typeof jobAlertToggleSchema>;
