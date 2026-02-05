CREATE TABLE "job_social_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_offer_id" uuid NOT NULL,
	"platform" varchar(20) NOT NULL,
	"posted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "job_social_post_job_platform_key" UNIQUE("job_offer_id","platform")
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-02-05T00:15:02.344Z';--> statement-breakpoint
CREATE INDEX "idx_job_social_post_job_id" ON "job_social_post" USING btree ("job_offer_id" uuid_ops);