CREATE TABLE "referral" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" varchar(255) NOT NULL,
	"referral_code" varchar(32) NOT NULL,
	"referred_user_id" varchar(255),
	"platform" varchar(20) NOT NULL,
	"recipient_identifier" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"converted_at" timestamp,
	CONSTRAINT "referral_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-02-03T14:58:13.015Z';--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referrer_id_users_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_referred_user_id_users_user_id_fk" FOREIGN KEY ("referred_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_referral_referrer" ON "referral" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_code" ON "referral" USING btree ("referral_code");