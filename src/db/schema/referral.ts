import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";

export const referral = pgTable(
  "referral",
  {
    id: serial().primaryKey(),
    referrer_id: varchar({ length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referral_code: varchar({ length: 32 }).notNull().unique(),
    referred_user_id: varchar({ length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    platform: varchar({ length: 20 }).notNull(), // 'email', 'whatsapp', 'facebook'
    recipient_identifier: varchar({ length: 255 }), // email or phone (optional)
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    converted_at: timestamp({ mode: "string" }), // null until signup
  },
  (table) => [
    index("idx_referral_referrer").on(table.referrer_id),
    index("idx_referral_code").on(table.referral_code),
  ]
);
