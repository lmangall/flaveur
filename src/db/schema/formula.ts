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

export const formula = pgTable(
  "formula",
  {
    formula_id: serial().primaryKey().notNull(),
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
    variation_group_id: integer(),
    variation_label: varchar({ length: 50 }),
    is_main_variation: boolean().default(false),
    // Project type and cosmetics-specific fields
    project_type: varchar({ length: 20 }).default("flavor"),
    cosmetic_product_type: varchar({ length: 30 }),
    target_ph: doublePrecision(),
    preservative_system: text(),
    manufacturing_notes: text(),
  },
  (table) => [
    index("idx_formula_category_id").using(
      "btree",
      table.category_id.asc().nullsLast().op("int4_ops")
    ),
    index("idx_formula_is_public").using(
      "btree",
      table.is_public.asc().nullsLast().op("bool_ops")
    ),
    index("idx_formula_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_formula_user_id").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops")
    ),
    index("idx_formula_variation_group_id").using(
      "btree",
      table.variation_group_id.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.category_id],
      foreignColumns: [category.category_id],
      name: "formula_category_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "formula_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.variation_group_id],
      foreignColumns: [variation_group.group_id],
      name: "formula_variation_group_id_fkey",
    }).onDelete("set null"),
    check(
      "formula_base_unit_check",
      sql`(base_unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
    check(
      "formula_status_check",
      sql`(status)::text = ANY (ARRAY[('draft'::character varying)::text, ('published'::character varying)::text, ('archived'::character varying)::text])`
    ),
    check(
      "formula_project_type_check",
      sql`(project_type)::text = ANY (ARRAY[('flavor'::character varying)::text, ('perfume'::character varying)::text, ('cosmetic'::character varying)::text]) OR project_type IS NULL`
    ),
  ]
);

export const substance_formula = pgTable(
  "substance_formula",
  {
    substance_id: integer().notNull(),
    formula_id: integer().notNull(),
    concentration: doublePrecision(),
    unit: varchar({ length: 20 }),
    order_index: integer(),
    supplier: varchar({ length: 100 }),
    dilution: varchar({ length: 50 }),
    price_per_kg: doublePrecision(),
    pyramid_position: varchar({ length: 20 }),
    phase: varchar({ length: 20 }),
  },
  (table) => [
    foreignKey({
      columns: [table.formula_id],
      foreignColumns: [formula.formula_id],
      name: "substance_formula_formula_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "substance_formula_substance_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.substance_id, table.formula_id],
      name: "substance_formula_pkey",
    }),
    check(
      "substance_formula_unit_check",
      sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
    check(
      "substance_formula_pyramid_position_check",
      sql`(pyramid_position)::text = ANY (ARRAY[('top'::character varying)::text, ('heart'::character varying)::text, ('base'::character varying)::text]) OR pyramid_position IS NULL`
    ),
    check(
      "substance_formula_phase_check",
      sql`(phase)::text = ANY (ARRAY[('water'::character varying)::text, ('oil'::character varying)::text, ('cool_down'::character varying)::text, ('surfactant'::character varying)::text, ('dry'::character varying)::text]) OR phase IS NULL`
    ),
  ]
);

export const ingredient_formula = pgTable(
  "ingredient_formula",
  {
    parent_formula_id: integer().notNull(),
    ingredient_formula_id: integer().notNull(),
    concentration: doublePrecision(),
    unit: varchar({ length: 20 }),
    order_index: integer(),
  },
  (table) => [
    foreignKey({
      columns: [table.ingredient_formula_id],
      foreignColumns: [formula.formula_id],
      name: "ingredient_formula_ingredient_formula_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.parent_formula_id],
      foreignColumns: [formula.formula_id],
      name: "ingredient_formula_parent_formula_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.parent_formula_id, table.ingredient_formula_id],
      name: "ingredient_formula_pkey",
    }),
    check(
      "ingredient_formula_unit_check",
      sql`(unit)::text = ANY (ARRAY[('g/kg'::character varying)::text, ('%(v/v)'::character varying)::text, ('g/L'::character varying)::text, ('mL/L'::character varying)::text, ('ppm'::character varying)::text])`
    ),
  ]
);

export const formula_shares = pgTable(
  "formula_shares",
  {
    share_id: serial().primaryKey().notNull(),
    formula_id: integer().notNull(),
    shared_with_user_id: text().notNull(),
    shared_by_user_id: text().notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_formula_shares_formula_id")
      .using("btree", table.formula_id.asc().nullsLast().op("int4_ops")),
    index("idx_formula_shares_shared_by_user_id")
      .using("btree", table.shared_by_user_id.asc().nullsLast().op("text_ops")),
    index("idx_formula_shares_shared_with_user_id")
      .using("btree", table.shared_with_user_id.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.formula_id],
      foreignColumns: [formula.formula_id],
      name: "formula_shares_formula_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.shared_with_user_id],
      foreignColumns: [users.id],
      name: "formula_shares_shared_with_user_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.shared_by_user_id],
      foreignColumns: [users.id],
      name: "formula_shares_shared_by_user_id_fkey",
    }).onDelete("cascade"),
    unique("formula_shares_formula_id_shared_with_user_id_key").on(
      table.formula_id,
      table.shared_with_user_id
    ),
  ]
);

export const formula_invites = pgTable(
  "formula_invites",
  {
    invite_id: serial().primaryKey().notNull(),
    formula_id: integer().notNull(),
    invited_email: text().notNull(),
    invited_by_user_id: text().notNull(),
    invite_token: uuid().defaultRandom(),
    status: text().default("pending").notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    accepted_at: timestamp({ mode: "string" }),
  },
  (table) => [
    index("idx_formula_invites_email")
      .using("btree", table.invited_email.asc().nullsLast().op("text_ops")),
    index("idx_formula_invites_formula_id")
      .using("btree", table.formula_id.asc().nullsLast().op("int4_ops")),
    index("idx_formula_invites_status")
      .using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("idx_formula_invites_token")
      .using("btree", table.invite_token.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.formula_id],
      foreignColumns: [formula.formula_id],
      name: "formula_invites_formula_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.invited_by_user_id],
      foreignColumns: [users.id],
      name: "formula_invites_invited_by_user_id_fkey",
    }).onDelete("cascade"),
    unique("formula_invites_formula_id_invited_email_key").on(
      table.formula_id,
      table.invited_email
    ),
    unique("formula_invites_invite_token_key").on(table.invite_token),
    check(
      "formula_invites_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])`
    ),
  ]
);
