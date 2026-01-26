import {
  pgTable,
  serial,
  varchar,
  timestamp,
  uuid,
  index,
  unique,
  text,
  integer,
  foreignKey,
} from "drizzle-orm/pg-core";

export const newsletter_subscribers = pgTable(
  "newsletter_subscribers",
  {
    id: serial().primaryKey().notNull(),
    email: varchar({ length: 255 }).notNull(),
    subscribed_at: timestamp({ mode: "string" }).defaultNow(),
    confirmed_at: timestamp({ mode: "string" }),
    unsubscribed_at: timestamp({ mode: "string" }),
    confirmation_token: uuid().defaultRandom(),
    source: varchar({ length: 50 }),
    locale: varchar({ length: 5 }).default("fr"),
  },
  (table) => [
    index("idx_newsletter_email")
      .using("btree", table.email.asc().nullsLast().op("text_ops")),
    index("idx_newsletter_token")
      .using("btree", table.confirmation_token.asc().nullsLast().op("uuid_ops")),
    unique("newsletter_subscribers_email_key").on(table.email),
  ]
);

export const category = pgTable(
  "category",
  {
    category_id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    parent_category_id: integer(),
    updated_at: timestamp({ mode: "string" }).default(
      new Date().toISOString()
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.parent_category_id],
      foreignColumns: [table.category_id],
      name: "category_parent_category_id_fkey",
    }).onDelete("set null"),
  ]
);
