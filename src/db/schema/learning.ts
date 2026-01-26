import {
  pgTable,
  index,
  integer,
  serial,
  text,
  timestamp,
  foreignKey,
  check,
  unique,
  boolean,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";
import { substance } from "./substance";

export const user_learning_queue = pgTable(
  "user_learning_queue",
  {
    queue_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    substance_id: integer().notNull(),
    priority: integer().default(0),
    target_date: date(),
    added_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_learning_queue_priority").using(
      "btree",
      table.user_id.asc().nullsLast().op("int4_ops"),
      table.priority.desc().nullsFirst().op("text_ops")
    ),
    index("idx_learning_queue_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "user_learning_queue_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "user_learning_queue_substance_id_fkey",
    }).onDelete("cascade"),
    unique("user_learning_queue_user_id_substance_id_key").on(
      table.user_id,
      table.substance_id
    ),
  ]
);

export const substance_learning_progress = pgTable(
  "substance_learning_progress",
  {
    progress_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    substance_id: integer().notNull(),
    has_smelled: boolean().default(false),
    smelled_at: timestamp({ mode: "string" }),
    has_tasted: boolean().default(false),
    tasted_at: timestamp({ mode: "string" }),
    status: text().default("not_started").notNull(),
    personal_notes: text(),
    personal_descriptors: text().array(),
    associations: text(),
    sample_photo_url: text(),
    concentration_notes: text(),
    started_at: timestamp({ mode: "string" }),
    mastered_at: timestamp({ mode: "string" }),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_learning_progress_status").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_learning_progress_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "substance_learning_progress_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "substance_learning_progress_substance_id_fkey",
    }).onDelete("cascade"),
    unique("substance_learning_progress_user_id_substance_id_key").on(
      table.user_id,
      table.substance_id
    ),
    check(
      "substance_learning_progress_status_check",
      sql`status = ANY (ARRAY['not_started'::text, 'learning'::text, 'confident'::text, 'mastered'::text])`
    ),
  ]
);

export const learning_streak = pgTable(
  "learning_streak",
  {
    streak_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    current_streak: integer().default(0),
    longest_streak: integer().default(0),
    last_study_date: date(),
    streak_freezes_available: integer().default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "learning_streak_user_id_fkey",
    }).onDelete("cascade"),
    unique("learning_streak_user_id_key").on(table.user_id),
  ]
);

export const learning_review = pgTable(
  "learning_review",
  {
    review_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    substance_id: integer().notNull(),
    scheduled_for: timestamp({ mode: "string" }).notNull(),
    completed_at: timestamp({ mode: "string" }),
    review_result: text(),
    confidence_after: integer(),
    notes: text(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_learning_review_scheduled")
      .using(
        "btree",
        table.user_id.asc().nullsLast().op("text_ops"),
        table.scheduled_for.asc().nullsLast().op("text_ops")
      )
      .where(sql`(completed_at IS NULL)`),
    index("idx_learning_review_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "learning_review_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "learning_review_substance_id_fkey",
    }).onDelete("cascade"),
    check(
      "learning_review_result_check",
      sql`(review_result IS NULL) OR (review_result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text]))`
    ),
    check(
      "learning_review_confidence_check",
      sql`(confidence_after IS NULL) OR ((confidence_after >= 1) AND (confidence_after <= 5))`
    ),
  ]
);

export const learning_quiz_attempt = pgTable(
  "learning_quiz_attempt",
  {
    attempt_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    substance_id: integer().notNull(),
    guessed_name: text(),
    observations: text(),
    result: text().notNull(),
    created_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_learning_quiz_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "learning_quiz_attempt_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "learning_quiz_attempt_substance_id_fkey",
    }).onDelete("cascade"),
    check(
      "learning_quiz_attempt_result_check",
      sql`result = ANY (ARRAY['correct'::text, 'incorrect'::text, 'partial'::text])`
    ),
  ]
);

export const learning_session = pgTable(
  "learning_session",
  {
    session_id: serial().primaryKey().notNull(),
    user_id: text().notNull(),
    name: text().notNull(),
    description: text(),
    scheduled_for: date(),
    duration_minutes: integer(),
    reflection_notes: text(),
    completed_at: timestamp({ mode: "string" }),
    created_at: timestamp({ mode: "string" }).defaultNow(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
  },
  (table) => [
    index("idx_learning_session_user")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.user_id],
      name: "learning_session_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const learning_session_substance = pgTable(
  "learning_session_substance",
  {
    session_id: integer().notNull(),
    substance_id: integer().notNull(),
    order_index: integer().default(0),
    session_code: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.session_id],
      foreignColumns: [learning_session.session_id],
      name: "learning_session_substance_session_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "learning_session_substance_substance_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.session_id, table.substance_id],
      name: "learning_session_substance_pkey",
    }),
  ]
);
