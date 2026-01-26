import {
  pgTable,
  index,
  uniqueIndex,
  integer,
  varchar,
  boolean,
  doublePrecision,
  serial,
  text,
  jsonb,
  timestamp,
  unique,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const substance = pgTable(
  "substance",
  {
    fema_number: integer().default(0).notNull(),
    common_name: varchar({ length: 255 }),
    synthetic: boolean(),
    molecular_weight: doublePrecision(),
    exact_mass: doublePrecision(),
    smile: varchar({ length: 2000 }),
    iupac_name: varchar({ length: 3000 }),
    unknown_natural: boolean(),
    olfactory_taste_notes: varchar({ length: 255 }),
    functional_groups: varchar({ length: 1000 }),
    inchi: varchar({ length: 3000 }),
    xlogp: doublePrecision(),
    is_natural: boolean(),
    flavor_profile: varchar({ length: 255 }),
    fema_flavor_profile: varchar({ length: 255 }),
    pubchem_id: integer(),
    cas_id: varchar({ length: 1000 }),
    substance_id: serial().primaryKey().notNull(),
    taste: text(),
    solubility: jsonb(),
    food_additive_classes: jsonb(),
    alternative_names: jsonb(),
    molecular_formula: varchar({ length: 255 }),
    melting_point_c: varchar({ length: 255 }),
    boiling_point_c: varchar({ length: 255 }),
    ec_number: varchar({ length: 1000 }),
    description: text(),
    type: varchar({ length: 255 }),
    pubchem_cid: varchar({ length: 255 }),
    pubchem_sid: varchar({ length: 255 }),
    odor: varchar({ length: 255 }),
    common_applications: varchar({ length: 255 }),
    fl_number: varchar({ length: 20 }),
    coe_number: varchar({ length: 20 }),
    jecfa_number: integer(),
    updated_at: timestamp({ mode: "string" }).defaultNow(),
    eu_policy_code: varchar({ length: 50 }),
  },
  (table) => [
    index("idx_substance_cas_id")
      .using("btree", table.cas_id.asc().nullsLast().op("text_ops")),
    index("idx_substance_coe_number")
      .using("btree", table.coe_number.asc().nullsLast().op("text_ops"))
      .where(sql`(coe_number IS NOT NULL)`),
    uniqueIndex("idx_substance_coe_unique")
      .using("btree", table.coe_number.asc().nullsLast().op("text_ops"))
      .where(sql`((coe_number IS NOT NULL) AND ((coe_number)::text <> ''::text))`),
    index("idx_substance_common_name")
      .using("btree", table.common_name.asc().nullsLast().op("text_ops")),
    index("idx_substance_eu_policy_code")
      .using("btree", table.eu_policy_code.asc().nullsLast().op("text_ops"))
      .where(sql`(eu_policy_code IS NOT NULL)`),
    index("idx_substance_fema_number")
      .using("btree", table.fema_number.asc().nullsLast().op("int4_ops")),
    index("idx_substance_fl_number")
      .using("btree", table.fl_number.asc().nullsLast().op("text_ops"))
      .where(sql`(fl_number IS NOT NULL)`),
    uniqueIndex("idx_substance_fl_unique")
      .using("btree", table.fl_number.asc().nullsLast().op("text_ops"))
      .where(sql`((fl_number IS NOT NULL) AND ((fl_number)::text <> ''::text))`),
    index("idx_substance_jecfa_number")
      .using("btree", table.jecfa_number.asc().nullsLast().op("int4_ops"))
      .where(sql`(jecfa_number IS NOT NULL)`),
    uniqueIndex("idx_substance_jecfa_unique")
      .using("btree", table.jecfa_number.asc().nullsLast().op("int4_ops"))
      .where(sql`(jecfa_number IS NOT NULL)`),
    index("idx_substance_name_trgm")
      .using("gin", table.common_name.asc().nullsLast().op("gin_trgm_ops")),
  ]
);

export const functional_group = pgTable(
  "functional_group",
  {
    functional_group_id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    smarts_pattern: varchar({ length: 500 }),
  },
  (table) => [unique("functional_group_name_key").on(table.name)]
);

export const substance_functional_group = pgTable(
  "substance_functional_group",
  {
    substance_id: integer().notNull(),
    functional_group_id: integer().notNull(),
  },
  (table) => [
    index("idx_sfg_group")
      .using("btree", table.functional_group_id.asc().nullsLast().op("int4_ops")),
    index("idx_sfg_substance")
      .using("btree", table.substance_id.asc().nullsLast().op("int4_ops")),
    foreignKey({
      columns: [table.substance_id],
      foreignColumns: [substance.substance_id],
      name: "substance_functional_group_substance_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.functional_group_id],
      foreignColumns: [functional_group.functional_group_id],
      name: "substance_functional_group_functional_group_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.substance_id, table.functional_group_id],
      name: "substance_functional_group_pkey",
    }),
  ]
);
