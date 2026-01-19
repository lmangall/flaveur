import { z } from "zod";

// Newsletter subscription schema
export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
  source: z.string().max(50).optional().default("homepage"),
  locale: z.string().max(5).optional().default("fr"),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

// UUID validation for confirmation tokens
export const confirmationTokenSchema = z.object({
  token: z
    .string()
    .uuid("Invalid confirmation token"),
});

export type ConfirmationTokenInput = z.infer<typeof confirmationTokenSchema>;
