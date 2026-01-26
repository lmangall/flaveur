import {
  pgTable,
  index,
  integer,
  varchar,
  boolean,
  doublePrecision,
  serial,
  text,
  jsonb,
  timestamp,
  foreignKey,
  check,
  uuid,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";
import { category } from "./misc";
import { substance } from "./substance";

// Variation group - groups related formula variations together
export const variation_group = pgTable(
  "variation_group",
  {
    group_id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    user_id: varchar({ length: 255 }),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_variation_group_user_id").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "variation_group_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const flavour = pgTable(
  "flavour",
  {
    flavour_id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    is_public: boolean().default(true),
    user_id: varchar({ length: 255 }),
    category_id: integer(),
    status: varchar({ length: 20 }).default("draft"),
    version: integer().default(1),
    base_unit: varchar({ length: 20 }).default("g/kg"),
    flavor_profile: jsonb().default([]),
    // Variation system columns
    variation_group_id: integer(),
    variation_label: varchar({ length: 50 }),
    is_main_variation: boolean().default(false),
  },
  (table) => [
    index("idx_flavour_category_id").using(
      "btree",
      table.category_id.asc().nullsLast().op("int4_ops")
    ),
    index("idx_flavour_is_public").using(
      "btree",
      table.is_public.asc().nullsLast().op("bool_ops")
    ),
    index("idx_flavour_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_flavour_user_id").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops")
    ),
    index("idx_flavour_variation_group_id").using(
      "btree",
      table.variation_group_id.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.category_id],
      foreignColumns: [category.category_id],
      name: "flavour_category_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "flavour_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.variation_group_id],
      foreignColumns: [variation_group.group_id],
      name: "flavour_variation_group_id_fkey",
    }).onDelete("set null"),
    check(
      "flavour_base_unit_check",
      sql`(base_unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
    check(
      "flavour_status_check",
      sql`(status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text])`
    ),
  ]
);

export const substance_flavour = pgTable(
  "substance_flavour",
  {
    substance_id: integer().notNull(),
    flavour_id: integer().notNull(),
    concentration: doublePrecision(),
    unit: varchar({ length: 20 }),
    order_index: integer(),
    supplier: varchar({ length: 100 }),
    dilution: varchar({ length: 50 }),
    price_per_kg: doublePrecision(),
  },
  (table) => [
    foreignKey({
      columns: [table.flavour_id],
      foreignColumns: [flavour.flavour_id],
      name: "substance_flavour_flavour_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "substance_flavour_substance_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.substance_id, table.flavour_id],
      name: "substance_flavour_pkey",
    }),
    check(
      "substance_flavour_unit_check",
      sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
  ]
);

export const ingredient_flavour = pgTable(
  "ingredient_flavour",
  {
    parent_flavour_id: integer().notNull(),
    ingredient_flavour_id: integer().notNull(),
    concentration: doublePrecision(),
    unit: varchar({ length: 20 }),
    order_index: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.ingredient_flavour_id],
      foreignColumns: [flavour.flavour_id],
      name: "ingredient_flavour_ingredient_flavour_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parent_flavour_id],
      foreignColumns: [flavour.flavour_id],
      name: "ingredient_flavour_parent_flavour_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.parent_flavour_id, table.ingredient_flavour_id],
      name: "ingredient_flavour_pkey",
    }),
    check(
      "ingredient_flavour_unit_check",
      sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
  ]
);

export const flavour_shares = pgTable(
  "flavour_shares",
  {
    share_id: serial().primaryKey().notNull(),
    flavour_id: integer().notNull(),
    shared_with_user_id: text().notNull(),
    shared_by_user_id: text().notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_flavour_shares_flavour_id")
      .using("btree", table.flavour_id.asc().nullsLast().op("int4_ops")),
    index("idx_flavour_shares_shared_by_user_id")
      .using("btree", table.shared_by_user_id.asc().nullsLast().op("text_ops")),
    index("idx_flavour_shares_shared_with_user_id")
      .using("btree", table.shared_with_user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.flavour_id],
      foreignColumns: [flavour.flavour_id],
      name: "flavour_shares_flavour_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.shared_with_user_id],
      foreignColumns: [users.id],
      name: "flavour_shares_shared_with_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.shared_by_user_id],
      foreignColumns: [users.id],
      name: "flavour_shares_shared_by_user_id_fkey",
    }).onDelete("cascade"),
    unique("flavour_shares_flavour_id_shared_with_user_id_key").on(
      table.flavour_id,
      table.shared_with_user_id
    ),
  ]
);

export const flavour_invites = pgTable(
  "flavour_invites",
  {
    invite_id: serial().primaryKey().notNull(),
    flavour_id: integer().notNull(),
    invited_email: text().notNull(),
    invited_by_user_id: text().notNull(),
    invite_token: uuid().defaultRandom(),
    status: text().default("pending").notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    accepted_at: timestamp({ mode: "string" }),
  },
  (table) => [
    index("idx_flavour_invites_email")
      .using("btree", table.invited_email.asc().nullsLast().op("text_ops")),
    index("idx_flavour_invites_flavour_id")
      .using("btree", table.flavour_id.asc().nullsLast().op("int4_ops")),
    index("idx_flavour_invites_status")
      .using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("idx_flavour_invites_token")
      .using("btree", table.invite_token.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.flavour_id],
      foreignColumns: [flavour.flavour_id],
      name: "flavour_invites_flavour_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.invited_by_user_id],
      foreignColumns: [users.id],
      name: "flavour_invites_invited_by_user_id_fkey",
    }).onDelete("cascade"),
    unique("flavour_invites_flavour_id_invited_email_key").on(
      table.flavour_id,
      table.invited_email
    ),
    unique("flavour_invites_invite_token_key").on(table.invite_token),
    check(
      "flavour_invites_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])`
    ),
  ]
);
