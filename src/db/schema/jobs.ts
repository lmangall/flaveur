import {
  pgTable,
  index,
  integer,
  serial,
  text,
  timestamp,
  foreignKey,
  check,
  uuid,
  boolean,
  jsonb,
  varchar,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";

export const job_offers = pgTable(
  "job_offers",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    title: text().notNull(),
    description: text().notNull(),
    company_name: text(),
    original_company_name: text(),
    through_recruiter: boolean().default(false).notNull(),
    source_website: text().notNull(),
    source_url: text().notNull(),
    location: text().notNull(),
    employment_type: text(),
    salary: text(),
    requirements: jsonb(),
    tags: jsonb(),
    status: boolean().default(true).notNull(),
    posted_at: timestamp({ mode: "string" }).notNull(),
    expires_at: timestamp({ mode: "string" }),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    industry: text().notNull(),
    experience_level: text(),
    contact_person: jsonb(),
  },
  (table) => [
    index("idx_job_offers_industry")
      .using("btree", table.industry.asc().nullsLast().op("text_ops")),
    index("idx_job_offers_posted_at")
      .using("btree", table.posted_at.desc().nullsFirst().op("timestamp_ops")),
    index("idx_job_offers_status")
      .using("btree", table.status.asc().nullsLast().op("bool_ops")),
    check(
      "job_offers_employment_type_check",
      sql`employment_type = ANY (ARRAY['Full-time'::text, 'Part-time'::text, 'Contract'::text, 'Internship'::text, 'Alternance'::text, 'Freelance'::text, 'CDI'::text, 'CDD'::text, 'Interim'::text])`
    ),
    check(
      "job_offers_experience_level_check",
      sql`experience_level = ANY (ARRAY['0-2'::text, '3-5'::text, '6-10'::text, '10+'::text])`
    ),
  ]
);

export const job_offer_interactions = pgTable(
  "job_offer_interactions",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    user_id: varchar({ length: 255 }).notNull(),
    job_offer_id: uuid().notNull(),
    action: text(),
    referrer: text(),
    timestamp: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_job_offer_interactions_job_offer_id")
      .using("btree", table.job_offer_id.asc().nullsLast().op("uuid_ops")),
    index("idx_job_offer_interactions_user_id")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.job_offer_id],
      foreignColumns: [job_offers.id],
      name: "job_offer_interactions_job_offer_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "job_offer_interactions_user_id_fkey",
    }).onDelete("cascade"),
    check(
      "job_offer_interactions_action_check",
      sql`action = ANY (ARRAY['viewed'::text, 'applied'::text, 'seen_contact'::text])`
    ),
  ]
);

export const job_alert_preferences = pgTable(
  "job_alert_preferences",
  {
    id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    email: varchar({ length: 255 }).notNull(),
    locations: text().array(),
    employment_types: text().array(),
    experience_levels: text().array(),
    keywords: text().array(),
    is_active: boolean().default(true),
    frequency: varchar({ length: 20 }).default("daily"),
    last_notified_at: timestamp({ mode: "string" }),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_job_alerts_active")
      .using("btree", table.is_active.asc().nullsLast().op("bool_ops"))
      .where(sql`(is_active = true)`),
    index("idx_job_alerts_user_id")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    unique("unique_user_alert").on(table.user_id),
  ]
);
