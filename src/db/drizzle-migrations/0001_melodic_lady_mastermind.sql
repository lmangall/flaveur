ALTER TABLE "user_badge" DROP CONSTRAINT "user_badge_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-26T19:47:43.706Z';--> statement-breakpoint
ALTER TABLE "substance_flavour" ADD COLUMN "supplier" varchar(100);--> statement-breakpoint
ALTER TABLE "substance_flavour" ADD COLUMN "dilution" varchar(50);--> statement-breakpoint
ALTER TABLE "substance_flavour" ADD COLUMN "price_per_kg" double precision;