import { z } from "zod";

// Create category schema
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters")
    .trim(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .transform((val) => val?.trim() || null),
  parent_category_id: z.number().int().positive().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

// Update category schema
export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional()
    .transform((val) => val?.trim() || null),
  parent_category_id: z.number().int().positive().nullable().optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// Client-side form schema
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  parent_category_id: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
