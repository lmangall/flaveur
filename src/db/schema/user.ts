import {
  pgTable,
  varchar,
  timestamp,
  unique,
  serial,
  text,
  index,
  boolean,
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
