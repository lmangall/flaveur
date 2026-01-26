import {
  pgTable,
  varchar,
  timestamp,
  unique,
  serial,
  text,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    user_id: varchar({ length: 255 }).primaryKey().notNull(),
    email: varchar({ length: 255 }),
    username: varchar({ length: 255 }).notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
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
