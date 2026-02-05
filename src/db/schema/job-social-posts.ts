import {
  pgTable,
  serial,
  varchar,
  timestamp,
  uuid,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const job_social_post = pgTable(
  "job_social_post",
  {
    id: serial().primaryKey().notNull(),
    job_offer_id: uuid().notNull(),
    platform: varchar({ length: 20 }).notNull(),
    posted_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_job_social_post_job_id").using(
      "btree",
      table.job_offer_id.asc().nullsLast().op("uuid_ops")
    ),
    unique("job_social_post_job_platform_key").on(
      table.job_offer_id,
      table.platform
    ),
  ]
);
