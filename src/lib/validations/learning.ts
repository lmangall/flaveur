import { z } from "zod";
import { LEARNING_STATUS_OPTIONS, REVIEW_RESULT_OPTIONS } from "@/constants";

// Extract valid values from constants
const validStatuses = LEARNING_STATUS_OPTIONS.map((s) => s.value) as [string, ...string[]];
const validResults = REVIEW_RESULT_OPTIONS.map((r) => r.value) as [string, ...string[]];

// Add to learning queue
export const addToQueueSchema = z.object({
  substance_id: z.number().int().positive("Substance ID must be a positive integer"),
  priority: z.number().int().min(0).default(0),
  target_date: z.string().date().optional(),
});

export type AddToQueueInput = z.infer<typeof addToQueueSchema>;

// Update learning progress
export const updateProgressSchema = z.object({
  substance_id: z.number().int().positive("Substance ID must be a positive integer"),
  has_smelled: z.boolean().optional(),
  has_tasted: z.boolean().optional(),
  status: z.enum(validStatuses).optional(),
  personal_notes: z.string().max(5000, "Notes must be less than 5000 characters").optional(),
  personal_descriptors: z
    .array(z.string().max(50, "Descriptor must be less than 50 characters"))
    .max(20, "Maximum 20 descriptors allowed")
    .optional(),
  associations: z.string().max(500, "Associations must be less than 500 characters").optional(),
  concentration_notes: z.string().max(500, "Concentration notes must be less than 500 characters").optional(),
});

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// Record sensory experience
export const recordSensorySchema = z.object({
  substance_id: z.number().int().positive("Substance ID must be a positive integer"),
  type: z.enum(["smell", "taste"]),
});

export type RecordSensoryInput = z.infer<typeof recordSensorySchema>;

// Status advancement validation
export const advanceStatusSchema = z.object({
  substance_id: z.number().int().positive("Substance ID must be a positive integer"),
  new_status: z.enum(["learning", "confident", "mastered"]),
});

export type AdvanceStatusInput = z.infer<typeof advanceStatusSchema>;

// Complete review
export const completeReviewSchema = z.object({
  review_id: z.number().int().positive("Review ID must be a positive integer"),
  result: z.enum(validResults, { message: "Please select a valid result" }),
  confidence_after: z.number().int().min(1).max(5, "Confidence must be between 1 and 5"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

export type CompleteReviewInput = z.infer<typeof completeReviewSchema>;

// Quiz attempt
export const submitQuizAttemptSchema = z.object({
  substance_id: z.number().int().positive("Substance ID must be a positive integer"),
  guessed_name: z.string().max(200, "Guess must be less than 200 characters").optional(),
  observations: z.string().max(2000, "Observations must be less than 2000 characters").optional(),
  result: z.enum(validResults, { message: "Please select a valid result" }),
});

export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

// Create study session
export const createSessionSchema = z.object({
  name: z
    .string()
    .min(1, "Session name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  scheduled_for: z.string().date().optional(),
  duration_minutes: z.number().int().positive().max(480, "Duration cannot exceed 8 hours").optional(),
  substance_ids: z
    .array(z.number().int().positive("Substance ID must be a positive integer"))
    .min(1, "At least one substance is required")
    .max(50, "Maximum 50 substances per session"),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// Complete session
export const completeSessionSchema = z.object({
  session_id: z.number().int().positive("Session ID must be a positive integer"),
  reflection_notes: z.string().max(2000, "Reflection must be less than 2000 characters").optional(),
});

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

// Reorder queue
export const reorderQueueSchema = z.object({
  ordered_ids: z.array(z.number().int().positive("Substance ID must be a positive integer")),
});

export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>;

// Update personal notes form schema (client-side)
export const progressNotesFormSchema = z.object({
  personal_notes: z.string().max(5000).optional(),
  personal_descriptors: z.string().optional(), // Comma-separated, will be split
  associations: z.string().max(500).optional(),
  concentration_notes: z.string().max(500).optional(),
});

export type ProgressNotesFormValues = z.infer<typeof progressNotesFormSchema>;
