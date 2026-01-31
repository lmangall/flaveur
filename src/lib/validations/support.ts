import { z } from "zod";

// Support message schema
export const supportMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message must be less than 5000 characters")
    .trim(),
});

export type SupportMessageInput = z.infer<typeof supportMessageSchema>;

// Guest email schema for starting a support conversation
export const guestEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim(),
});

export type GuestEmailInput = z.infer<typeof guestEmailSchema>;

// UUID validation for guest session
export const guestSessionSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
});

export type GuestSessionInput = z.infer<typeof guestSessionSchema>;
