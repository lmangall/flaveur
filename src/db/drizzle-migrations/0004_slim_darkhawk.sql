CREATE TABLE "support_conversation" (
	"conversation_id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"guest_email" varchar(255),
	"guest_session_id" uuid DEFAULT gen_random_uuid(),
	"subject" varchar(255),
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"closed_at" timestamp,
	"has_unread_admin" boolean DEFAULT true NOT NULL,
	"last_admin_read_at" timestamp,
	CONSTRAINT "support_conversation_status_check" CHECK ((status)::text = ANY (ARRAY['open'::text, 'closed'::text, 'pending'::text]))
);
--> statement-breakpoint
CREATE TABLE "support_message" (
	"message_id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_type" varchar(20) NOT NULL,
	"sender_user_id" varchar(255),
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "support_message_sender_type_check" CHECK ((sender_type)::text = ANY (ARRAY['user'::text, 'guest'::text, 'admin'::text]))
);
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT '2026-01-27T00:06:06.007Z';--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "onboarding_status" varchar(20) DEFAULT 'not_started';--> statement-breakpoint
ALTER TABLE "support_conversation" ADD CONSTRAINT "support_conversation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversation"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_support_conversation_user_id" ON "support_conversation" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_conversation_guest_email" ON "support_conversation" USING btree ("guest_email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_conversation_guest_session" ON "support_conversation" USING btree ("guest_session_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_support_conversation_status" ON "support_conversation" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_support_conversation_has_unread" ON "support_conversation" USING btree ("has_unread_admin" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_support_message_conversation_id" ON "support_message" USING btree ("conversation_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_support_message_created_at" ON "support_message" USING btree ("created_at");