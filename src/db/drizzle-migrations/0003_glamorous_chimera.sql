CREATE TABLE "user_profile" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"bio" text,
	"profile_type" varchar(50),
	"organization" varchar(255),
	"job_title" varchar(255),
	"location" varchar(255),
	"years_of_experience" varchar(20),
	"specializations" text[],
	"certifications" text[],
	"field_of_study" varchar(255),
	"professional_memberships" text[],
	"is_profile_public" boolean DEFAULT true,
	"open_to_opportunities" boolean DEFAULT false,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_social_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" varchar(500) NOT NULL,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-26T23:59:28.848Z';--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_social_link" ADD CONSTRAINT "user_social_link_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_social_link_user" ON "user_social_link" USING btree ("user_id");