-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "substance" (
	"fema_number" integer DEFAULT 0 NOT NULL,
	"common_name" varchar(255),
	"synthetic" boolean,
	"molecular_weight" double precision,
	"exact_mass" double precision,
	"smile" varchar(2000),
	"iupac_name" varchar(3000),
	"unknown_natural" boolean,
	"olfactory_taste_notes" varchar(255),
	"functional_groups" varchar(1000),
	"inchi" varchar(3000),
	"xlogp" double precision,
	"is_natural" boolean,
	"flavor_profile" varchar(255),
	"fema_flavor_profile" varchar(255),
	"pubchem_id" integer,
	"cas_id" varchar(1000),
	"substance_id" serial PRIMARY KEY NOT NULL,
	"taste" text,
	"solubility" jsonb,
	"food_additive_classes" jsonb,
	"alternative_names" jsonb,
	"molecular_formula" varchar(255),
	"melting_point_c" varchar(255),
	"boiling_point_c" varchar(255),
	"ec_number" varchar(1000),
	"description" text,
	"type" varchar(255),
	"pubchem_cid" varchar(255),
	"pubchem_sid" varchar(255),
	"odor" varchar(255),
	"common_applications" varchar(255),
	"fl_number" varchar(20),
	"coe_number" varchar(20),
	"jecfa_number" integer,
	"updated_at" timestamp DEFAULT now(),
	"eu_policy_code" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "job_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"company_name" text,
	"original_company_name" text,
	"through_recruiter" boolean DEFAULT false NOT NULL,
	"source_website" text NOT NULL,
	"source_url" text NOT NULL,
	"location" text NOT NULL,
	"employment_type" text,
	"salary" text,
	"requirements" jsonb,
	"tags" jsonb,
	"status" boolean DEFAULT true NOT NULL,
	"posted_at" timestamp NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"industry" text NOT NULL,
	"experience_level" text,
	"contact_person" jsonb,
	CONSTRAINT "job_offers_employment_type_check" CHECK (employment_type = ANY (ARRAY['Full-time'::text, 'Part-time'::text, 'Contract'::text, 'Internship'::text, 'Freelance'::text, 'CDI'::text, 'CDD'::text, 'Interim'::text])),
	CONSTRAINT "job_offers_experience_level_check" CHECK (experience_level = ANY (ARRAY['Entry'::text, 'Mid'::text, 'Senior'::text, 'Executive'::text]))
);
--> statement-breakpoint
CREATE TABLE "flavour" (
	"flavour_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"is_public" boolean DEFAULT true,
	"user_id" varchar(255),
	"category_id" integer,
	"status" varchar(20) DEFAULT 'draft',
	"version" integer DEFAULT 1,
	"base_unit" varchar(20) DEFAULT 'g/kg',
	"flavor_profile" jsonb DEFAULT '[]'::jsonb,
	CONSTRAINT "flavour_base_unit_check" CHECK ((base_unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])),
	CONSTRAINT "flavour_status_check" CHECK ((status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text]))
);
--> statement-breakpoint
CREATE TABLE "category" (
	"category_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"parent_category_id" integer,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"username" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "job_offer_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"job_offer_id" uuid NOT NULL,
	"action" text,
	"referrer" text,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "job_offer_interactions_action_check" CHECK (action = ANY (ARRAY['viewed'::text, 'applied'::text, 'seen_contact'::text]))
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"workspace_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"subscribed_at" timestamp DEFAULT now(),
	"confirmed_at" timestamp,
	"unsubscribed_at" timestamp,
	"confirmation_token" uuid DEFAULT gen_random_uuid(),
	"source" varchar(50),
	"locale" varchar(5) DEFAULT 'fr',
	CONSTRAINT "newsletter_subscribers_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "job_alert_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"locations" text[],
	"employment_types" text[],
	"experience_levels" text[],
	"keywords" text[],
	"is_active" boolean DEFAULT true,
	"frequency" varchar(20) DEFAULT 'daily',
	"last_notified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_user_alert" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "workspace_member" (
	"member_id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workspace_member_workspace_id_user_id_key" UNIQUE("workspace_id","user_id"),
	CONSTRAINT "workspace_member_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text]))
);
--> statement-breakpoint
CREATE TABLE "workspace_invite" (
	"invite_id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"invite_token" uuid DEFAULT gen_random_uuid(),
	"role" text DEFAULT 'viewer' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workspace_invite_workspace_id_invited_email_key" UNIQUE("workspace_id","invited_email"),
	CONSTRAINT "workspace_invite_invite_token_key" UNIQUE("invite_token"),
	CONSTRAINT "workspace_invite_role_check" CHECK (role = ANY (ARRAY['editor'::text, 'viewer'::text])),
	CONSTRAINT "workspace_invite_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text]))
);
--> statement-breakpoint
CREATE TABLE "flavour_shares" (
	"share_id" serial PRIMARY KEY NOT NULL,
	"flavour_id" integer NOT NULL,
	"shared_with_user_id" text NOT NULL,
	"shared_by_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "flavour_shares_flavour_id_shared_with_user_id_key" UNIQUE("flavour_id","shared_with_user_id")
);
--> statement-breakpoint
CREATE TABLE "flavour_invites" (
	"invite_id" serial PRIMARY KEY NOT NULL,
	"flavour_id" integer NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by_user_id" text NOT NULL,
	"invite_token" uuid DEFAULT gen_random_uuid(),
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"accepted_at" timestamp,
	CONSTRAINT "flavour_invites_flavour_id_invited_email_key" UNIQUE("flavour_id","invited_email"),
	CONSTRAINT "flavour_invites_invite_token_key" UNIQUE("invite_token"),
	CONSTRAINT "flavour_invites_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text]))
);
--> statement-breakpoint
CREATE TABLE "functional_group" (
	"functional_group_id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"smarts_pattern" varchar(500),
	CONSTRAINT "functional_group_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "workspace_document" (
	"document_id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"content" text,
	"url" text,
	"file_size" integer,
	"mime_type" text,
	"created_by" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workspace_document_type_check" CHECK (type = ANY (ARRAY['image'::text, 'csv'::text, 'markdown'::text, 'pdf'::text, 'file'::text]))
);
--> statement-breakpoint
CREATE TABLE "user_learning_queue" (
	"queue_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"substance_id" integer NOT NULL,
	"priority" integer DEFAULT 0,
	"target_date" date,
	"added_at" timestamp DEFAULT now(),
	CONSTRAINT "user_learning_queue_user_id_substance_id_key" UNIQUE("user_id","substance_id")
);
--> statement-breakpoint
CREATE TABLE "substance_learning_progress" (
	"progress_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"substance_id" integer NOT NULL,
	"has_smelled" boolean DEFAULT false,
	"smelled_at" timestamp,
	"has_tasted" boolean DEFAULT false,
	"tasted_at" timestamp,
	"status" text DEFAULT 'not_started' NOT NULL,
	"personal_notes" text,
	"personal_descriptors" text[],
	"associations" text,
	"sample_photo_url" text,
	"concentration_notes" text,
	"started_at" timestamp,
	"mastered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "substance_learning_progress_user_id_substance_id_key" UNIQUE("user_id","substance_id"),
	CONSTRAINT "substance_learning_progress_status_check" CHECK (status = ANY (ARRAY['not_started'::text, 'learning'::text, 'confident'::text, 'mastered'::text]))
);
--> statement-breakpoint
CREATE TABLE "learning_streak" (
	"streak_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_study_date" date,
	"streak_freezes_available" integer DEFAULT 0,
	CONSTRAINT "learning_streak_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "learning_review" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"substance_id" integer NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"completed_at" timestamp,
	"review_result" text,
	"confidence_after" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "learning_review_result_check" CHECK ((review_result IS NULL) OR (review_result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text]))),
	CONSTRAINT "learning_review_confidence_check" CHECK ((confidence_after IS NULL) OR ((confidence_after >= 1) AND (confidence_after <= 5)))
);
--> statement-breakpoint
CREATE TABLE "learning_quiz_attempt" (
	"attempt_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"substance_id" integer NOT NULL,
	"guessed_name" text,
	"observations" text,
	"result" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "learning_quiz_attempt_result_check" CHECK (result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text]))
);
--> statement-breakpoint
CREATE TABLE "learning_session" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scheduled_for" date,
	"duration_minutes" integer,
	"reflection_notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badge" (
	"badge_id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_key" text NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	CONSTRAINT "user_badge_user_id_badge_key_key" UNIQUE("user_id","badge_key")
);
--> statement-breakpoint
CREATE TABLE "substance_functional_group" (
	"substance_id" integer NOT NULL,
	"functional_group_id" integer NOT NULL,
	CONSTRAINT "substance_functional_group_pkey" PRIMARY KEY("substance_id","functional_group_id")
);
--> statement-breakpoint
CREATE TABLE "workspace_flavour" (
	"workspace_id" integer NOT NULL,
	"flavour_id" integer NOT NULL,
	"added_by" text,
	"added_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "workspace_flavour_pkey" PRIMARY KEY("workspace_id","flavour_id")
);
--> statement-breakpoint
CREATE TABLE "learning_session_substance" (
	"session_id" integer NOT NULL,
	"substance_id" integer NOT NULL,
	"order_index" integer DEFAULT 0,
	"session_code" text,
	CONSTRAINT "learning_session_substance_pkey" PRIMARY KEY("session_id","substance_id")
);
--> statement-breakpoint
CREATE TABLE "substance_flavour" (
	"substance_id" integer NOT NULL,
	"flavour_id" integer NOT NULL,
	"concentration" double precision,
	"unit" varchar(20),
	"order_index" integer,
	CONSTRAINT "substance_flavour_pkey" PRIMARY KEY("substance_id","flavour_id"),
	CONSTRAINT "substance_flavour_unit_check" CHECK ((unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text]))
);
--> statement-breakpoint
CREATE TABLE "ingredient_flavour" (
	"parent_flavour_id" integer NOT NULL,
	"ingredient_flavour_id" integer NOT NULL,
	"concentration" double precision,
	"unit" varchar(20),
	"order_index" integer,
	CONSTRAINT "ingredient_flavour_pkey" PRIMARY KEY("parent_flavour_id","ingredient_flavour_id"),
	CONSTRAINT "ingredient_flavour_unit_check" CHECK ((unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text]))
);
--> statement-breakpoint
ALTER TABLE "flavour" ADD CONSTRAINT "flavour_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."category"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour" ADD CONSTRAINT "flavour_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "public"."category"("category_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_offer_interactions" ADD CONSTRAINT "job_offer_interactions_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "public"."job_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_offer_interactions" ADD CONSTRAINT "job_offer_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invite" ADD CONSTRAINT "workspace_invite_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invite" ADD CONSTRAINT "workspace_invite_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour_shares" ADD CONSTRAINT "flavour_shares_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour_shares" ADD CONSTRAINT "flavour_shares_shared_with_user_id_fkey" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour_shares" ADD CONSTRAINT "flavour_shares_shared_by_user_id_fkey" FOREIGN KEY ("shared_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour_invites" ADD CONSTRAINT "flavour_invites_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flavour_invites" ADD CONSTRAINT "flavour_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_document" ADD CONSTRAINT "workspace_document_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_document" ADD CONSTRAINT "workspace_document_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_queue" ADD CONSTRAINT "user_learning_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_queue" ADD CONSTRAINT "user_learning_queue_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_learning_progress" ADD CONSTRAINT "substance_learning_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_learning_progress" ADD CONSTRAINT "substance_learning_progress_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_streak" ADD CONSTRAINT "learning_streak_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_review" ADD CONSTRAINT "learning_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_review" ADD CONSTRAINT "learning_review_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_quiz_attempt" ADD CONSTRAINT "learning_quiz_attempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_quiz_attempt" ADD CONSTRAINT "learning_quiz_attempt_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_session" ADD CONSTRAINT "learning_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_functional_group" ADD CONSTRAINT "substance_functional_group_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_functional_group" ADD CONSTRAINT "substance_functional_group_functional_group_id_fkey" FOREIGN KEY ("functional_group_id") REFERENCES "public"."functional_group"("functional_group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_flavour" ADD CONSTRAINT "workspace_flavour_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("workspace_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_flavour" ADD CONSTRAINT "workspace_flavour_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_flavour" ADD CONSTRAINT "workspace_flavour_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_session_substance" ADD CONSTRAINT "learning_session_substance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."learning_session"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_session_substance" ADD CONSTRAINT "learning_session_substance_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_flavour" ADD CONSTRAINT "substance_flavour_flavour_id_fkey" FOREIGN KEY ("flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "substance_flavour" ADD CONSTRAINT "substance_flavour_substance_id_fkey" FOREIGN KEY ("substance_id") REFERENCES "public"."substance"("substance_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_flavour" ADD CONSTRAINT "ingredient_flavour_ingredient_flavour_id_fkey" FOREIGN KEY ("ingredient_flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_flavour" ADD CONSTRAINT "ingredient_flavour_parent_flavour_id_fkey" FOREIGN KEY ("parent_flavour_id") REFERENCES "public"."flavour"("flavour_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_substance_cas_id" ON "substance" USING btree ("cas_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_substance_coe_number" ON "substance" USING btree ("coe_number" text_ops) WHERE (coe_number IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_substance_coe_unique" ON "substance" USING btree ("coe_number" text_ops) WHERE ((coe_number IS NOT NULL) AND ((coe_number)::text <> ''::text));--> statement-breakpoint
CREATE INDEX "idx_substance_common_name" ON "substance" USING btree ("common_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_substance_eu_policy_code" ON "substance" USING btree ("eu_policy_code" text_ops) WHERE (eu_policy_code IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_substance_fema_number" ON "substance" USING btree ("fema_number" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_substance_fl_number" ON "substance" USING btree ("fl_number" text_ops) WHERE (fl_number IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_substance_fl_unique" ON "substance" USING btree ("fl_number" text_ops) WHERE ((fl_number IS NOT NULL) AND ((fl_number)::text <> ''::text));--> statement-breakpoint
CREATE INDEX "idx_substance_jecfa_number" ON "substance" USING btree ("jecfa_number" int4_ops) WHERE (jecfa_number IS NOT NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_substance_jecfa_unique" ON "substance" USING btree ("jecfa_number" int4_ops) WHERE (jecfa_number IS NOT NULL);--> statement-breakpoint
CREATE INDEX "idx_substance_name_trgm" ON "substance" USING gin ("common_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_job_offers_industry" ON "job_offers" USING btree ("industry" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_offers_posted_at" ON "job_offers" USING btree ("posted_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_job_offers_status" ON "job_offers" USING btree ("status" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_category_id" ON "flavour" USING btree ("category_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_is_public" ON "flavour" USING btree ("is_public" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_status" ON "flavour" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_user_id" ON "flavour" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_job_offer_interactions_job_offer_id" ON "job_offer_interactions" USING btree ("job_offer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_offer_interactions_user_id" ON "job_offer_interactions" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_email" ON "newsletter_subscribers" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_newsletter_token" ON "newsletter_subscribers" USING btree ("confirmation_token" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_job_alerts_active" ON "job_alert_preferences" USING btree ("is_active" bool_ops) WHERE (is_active = true);--> statement-breakpoint
CREATE INDEX "idx_job_alerts_user_id" ON "job_alert_preferences" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_member_user_id" ON "workspace_member" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_member_workspace_id" ON "workspace_member" USING btree ("workspace_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_invite_email" ON "workspace_invite" USING btree ("invited_email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_invite_status" ON "workspace_invite" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_invite_token" ON "workspace_invite" USING btree ("invite_token" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_invite_workspace_id" ON "workspace_invite" USING btree ("workspace_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_shares_flavour_id" ON "flavour_shares" USING btree ("flavour_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_shares_shared_by_user_id" ON "flavour_shares" USING btree ("shared_by_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_shares_shared_with_user_id" ON "flavour_shares" USING btree ("shared_with_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_invites_email" ON "flavour_invites" USING btree ("invited_email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_invites_flavour_id" ON "flavour_invites" USING btree ("flavour_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_invites_status" ON "flavour_invites" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_flavour_invites_token" ON "flavour_invites" USING btree ("invite_token" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_document_type" ON "workspace_document" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_document_workspace_id" ON "workspace_document" USING btree ("workspace_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_queue_priority" ON "user_learning_queue" USING btree ("user_id" int4_ops,"priority" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_queue_user" ON "user_learning_queue" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_progress_status" ON "substance_learning_progress" USING btree ("user_id" text_ops,"status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_progress_user" ON "substance_learning_progress" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_review_scheduled" ON "learning_review" USING btree ("user_id" text_ops,"scheduled_for" text_ops) WHERE (completed_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_learning_review_user" ON "learning_review" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_quiz_user" ON "learning_quiz_attempt" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_learning_session_user" ON "learning_session" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_badge_user" ON "user_badge" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sfg_group" ON "substance_functional_group" USING btree ("functional_group_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_sfg_substance" ON "substance_functional_group" USING btree ("substance_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_flavour_flavour_id" ON "workspace_flavour" USING btree ("flavour_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_workspace_flavour_workspace_id" ON "workspace_flavour" USING btree ("workspace_id" int4_ops);
*/