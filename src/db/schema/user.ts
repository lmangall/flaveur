import {
  pgTable,
  varchar,
  timestamp,
  unique,
  serial,
  text,
  index,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// User table - compatible with Better Auth via schema mapping in auth.ts
// Better Auth fields are added as new columns
// Note: 'id' is the JS field name, 'user_id' is the DB column name for Better Auth compatibility
export const users = pgTable(
  "users",
  {
    id: varchar("user_id", { length: 255 }).primaryKey().notNull(),
    email: varchar({ length: 255 }),
    name: varchar("username", { length: 255 }).notNull(),
    // Better Auth required fields
    emailVerified: boolean("email_verified").default(false),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [unique("users_email_key").on(table.email)]
);

export const user_badge = pgTable(
  "user_badge",
  {
    badge_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    badge_key: text().notNull(),
    earned_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_user_badge_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    unique("user_badge_user_id_badge_key_key").on(table.user_id, table.badge_key),
  ]
);

// Extended user profile - separate from users table to avoid Better Auth conflicts
export const user_profile = pgTable("user_profile", {
  user_id: varchar({ length: 255 })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),

  // Core Identity
  bio: text(), // 500 char limit enforced in app
  profile_type: varchar({ length: 50 }), // student, professional, hobbyist, educator
  organization: varchar({ length: 255 }), // company or school
  job_title: varchar({ length: 255 }), // role/position
  location: varchar({ length: 255 }), // city, country

  // Professional Background
  years_of_experience: varchar({ length: 20 }), // 0-1, 2-5, 6-10, 10+
  specializations: text().array(), // free-form tags
  certifications: text().array(), // industry certifications

  // Education & Memberships
  field_of_study: varchar({ length: 255 }), // Chemistry, Food Science, etc.
  professional_memberships: text().array(), // SFC, IFEAT, FEMA, etc.

  // Visibility
  is_profile_public: boolean().default(true), // public by default
  open_to_opportunities: boolean().default(false),

  // Onboarding
  onboarding_status: varchar({ length: 20 }).default("not_started"), // not_started, in_progress, completed, skipped

  // Timestamps
  updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
});

// Flexible social links - users can add any platform
export const user_social_link = pgTable(
  "user_social_link",
  {
    id: serial().primaryKey(),
    user_id: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: varchar({ length: 50 }).notNull(), // linkedin, instagram, twitter, github, website, etc.
    url: varchar({ length: 500 }).notNull(),
    display_order: integer().default(0),
  },
  (table) => [index("idx_social_link_user").on(table.user_id)]
);
