CREATE TABLE "job_search_monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"search_url" text NOT NULL,
	"site_key" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"last_listing_count" integer DEFAULT 0,
	"last_error" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "monitored_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"company" text,
	"location" text,
	"employment_type" text,
	"salary" text,
	"listing_url" text NOT NULL,
	"notified" boolean DEFAULT false NOT NULL,
	"imported_job_id" text,
	"first_seen_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"last_seen_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "unique_monitor_external_id" UNIQUE("monitor_id","external_id")
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-02-04T23:57:29.748Z';--> statement-breakpoint
ALTER TABLE "monitored_listings" ADD CONSTRAINT "monitored_listings_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "public"."job_search_monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_job_search_monitors_active" ON "job_search_monitors" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_monitored_listings_monitor_id" ON "monitored_listings" USING btree ("monitor_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_monitored_listings_notified" ON "monitored_listings" USING btree ("notified" bool_ops) WHERE (notified = false);