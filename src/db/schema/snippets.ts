import {
  pgTable,
  serial,
  varchar,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const snippet_post = pgTable(
  "snippet_post",
  {
    id: serial().primaryKey().notNull(),
    fact_id: varchar({ length: 50 }).notNull(),
    platform: varchar({ length: 20 }).notNull(),
    posted_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_snippet_post_fact_id").using(
      "btree",
      table.fact_id.asc().nullsLast().op("text_ops")
    ),
    unique("snippet_post_fact_platform_key").on(table.fact_id, table.platform),
  ]
);
