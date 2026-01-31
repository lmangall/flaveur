ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-31T11:51:30.348Z';--> statement-breakpoint
ALTER TABLE "support_conversation" ADD COLUMN "user_typing_at" timestamp;--> statement-breakpoint
ALTER TABLE "support_conversation" ADD COLUMN "admin_typing_at" timestamp;