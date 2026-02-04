CREATE TABLE "snippet_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"fact_id" varchar(50) NOT NULL,
	"platform" varchar(20) NOT NULL,
	"posted_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "snippet_post_fact_platform_key" UNIQUE("fact_id","platform")
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-02-04T21:49:36.901Z';--> statement-breakpoint
CREATE INDEX "idx_snippet_post_fact_id" ON "snippet_post" USING btree ("fact_id" text_ops);