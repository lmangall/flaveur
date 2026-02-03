ALTER TABLE "job_offers" DROP CONSTRAINT "job_offers_employment_type_check";--> statement-breakpoint
ALTER TABLE "job_offers" DROP CONSTRAINT "job_offers_experience_level_check";--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-02-02T20:17:54.145Z';--> statement-breakpoint
ALTER TABLE "flavour" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_employment_type_check" CHECK (employment_type = ANY (ARRAY['Full-time'::text, 'Part-time'::text, 'Contract'::text, 'Internship'::text, 'Alternance'::text, 'Freelance'::text, 'CDI'::text, 'CDD'::text, 'Interim'::text]));--> statement-breakpoint
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_experience_level_check" CHECK (experience_level = ANY (ARRAY['0-2'::text, '3-5'::text, '6-10'::text, '10+'::text]));