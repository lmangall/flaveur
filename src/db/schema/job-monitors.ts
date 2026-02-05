import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Stores the search URLs the admin wants to monitor for new job listings
export const job_search_monitors = pgTable(
  "job_search_monitors",
  {
    id: serial().primaryKey().notNull(),
    label: text().notNull(),
    search_url: text().notNull(),
    site_key: text().notNull(),
    is_active: boolean().default(true).notNull(),
    last_checked_at: timestamp({ mode: "string" }),
    last_listing_count: integer().default(0),
    last_error: text(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_job_search_monitors_active").using(
      "btree",
      table.is_active.asc().nullsLast().op("bool_ops")
    ),
  ]
);

// Stores individual job listings discovered from monitored search pages
export const monitored_listings = pgTable(
  "monitored_listings",
  {
    id: serial().primaryKey().notNull(),
    monitor_id: integer().notNull(),
    external_id: text().notNull(),
    title: text().notNull(),
    company: text(),
    location: text(),
    employment_type: text(),
    salary: text(),
    listing_url: text().notNull(),
    notified: boolean().default(false).notNull(),
    imported_job_id: text(),
    first_seen_at: timestamp({ mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    last_seen_at: timestamp({ mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
  },
  (table) => [
    unique("unique_monitor_external_id").on(table.monitor_id, table.external_id),
    index("idx_monitored_listings_monitor_id").using(
      "btree",
      table.monitor_id.asc().nullsLast().op("int4_ops")
    ),
    index("idx_monitored_listings_notified")
      .using("btree", table.notified.asc().nullsLast().op("bool_ops"))
      .where(sql`(notified = false)`),
    foreignKey({
      columns: [table.monitor_id],
      foreignColumns: [job_search_monitors.id],
      name: "monitored_listings_monitor_id_fkey",
    }).onDelete("cascade"),
  ]
);
