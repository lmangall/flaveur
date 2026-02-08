import {
  pgTable,
  index,
  integer,
  varchar,
  serial,
  text,
  timestamp,
  foreignKey,
  check,
  uuid,
  unique,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";
import { formula } from "./formula";

export const workspace = pgTable(
  "workspace",
  {
    workspace_id: serial().primaryKey().notNull(),
    name: text().notNull(),
    description: text(),
    created_by: text().notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [users.id],
      name: "workspace_created_by_fkey",
    }).onDelete("cascade"),
  ]
);

export const workspace_member = pgTable(
  "workspace_member",
  {
    member_id: serial().primaryKey().notNull(),
    workspace_id: integer().notNull(),
    user_id: text().notNull(),
    role: text().default("viewer").notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workspace_member_user_id")
      .using("btree", table.user_id.asc().nullsLast().op("text_ops")),
    index("idx_workspace_member_workspace_id")
      .using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
    foreignKey({
      columns: [table.workspace_id],
      foreignColumns: [workspace.workspace_id],
      name: "workspace_member_workspace_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "workspace_member_user_id_fkey",
    }).onDelete("cascade"),
    unique("workspace_member_workspace_id_user_id_key").on(
      table.workspace_id,
      table.user_id
    ),
    check(
      "workspace_member_role_check",
      sql`role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text])`
    ),
  ]
);

export const workspace_invite = pgTable(
  "workspace_invite",
  {
    invite_id: serial().primaryKey().notNull(),
    workspace_id: integer().notNull(),
    invited_email: text().notNull(),
    invited_by_user_id: text().notNull(),
    invite_token: uuid().defaultRandom(),
    role: text().default("viewer").notNull(),
    status: text().default("pending").notNull(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workspace_invite_email")
      .using("btree", table.invited_email.asc().nullsLast().op("text_ops")),
    index("idx_workspace_invite_status")
      .using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("idx_workspace_invite_token")
      .using("btree", table.invite_token.asc().nullsLast().op("uuid_ops")),
    index("idx_workspace_invite_workspace_id")
      .using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
    foreignKey({
      columns: [table.workspace_id],
      foreignColumns: [workspace.workspace_id],
      name: "workspace_invite_workspace_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.invited_by_user_id],
      foreignColumns: [users.id],
      name: "workspace_invite_invited_by_user_id_fkey",
    }).onDelete("cascade"),
    unique("workspace_invite_workspace_id_invited_email_key").on(
      table.workspace_id,
      table.invited_email
    ),
    unique("workspace_invite_invite_token_key").on(table.invite_token),
    check(
      "workspace_invite_role_check",
      sql`role = ANY (ARRAY['editor'::text, 'viewer'::text])`
    ),
    check(
      "workspace_invite_status_check",
      sql`status = ANY (ARRAY['pending'::text, 'accepted'::text, 'expired'::text])`
    ),
  ]
);

export const workspace_document = pgTable(
  "workspace_document",
  {
    document_id: serial().primaryKey().notNull(),
    workspace_id: integer().notNull(),
    name: text().notNull(),
    description: text(),
    type: text().notNull(),
    content: text(),
    url: text(),
    file_size: integer(),
    mime_type: text(),
    created_by: text(),
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workspace_document_type")
      .using("btree", table.type.asc().nullsLast().op("text_ops")),
    index("idx_workspace_document_workspace_id")
      .using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
    foreignKey({
      columns: [table.workspace_id],
      foreignColumns: [workspace.workspace_id],
      name: "workspace_document_workspace_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.created_by],
      foreignColumns: [users.id],
      name: "workspace_document_created_by_fkey",
    }).onDelete("set null"),
    check(
      "workspace_document_type_check",
      sql`type = ANY (ARRAY['image'::text, 'csv'::text, 'markdown'::text, 'pdf'::text, 'file'::text])`
    ),
  ]
);

export const workspace_formula = pgTable(
  "workspace_formula",
  {
    workspace_id: integer().notNull(),
    formula_id: integer().notNull(),
    added_by: text(),
    added_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_workspace_formula_formula_id")
      .using("btree", table.formula_id.asc().nullsLast().op("int4_ops")),
    index("idx_workspace_formula_workspace_id")
      .using("btree", table.workspace_id.asc().nullsLast().op("int4_ops")),
    foreignKey({
      columns: [table.workspace_id],
      foreignColumns: [workspace.workspace_id],
      name: "workspace_formula_workspace_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.formula_id],
      foreignColumns: [formula.formula_id],
      name: "workspace_formula_formula_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.added_by],
      foreignColumns: [users.id],
      name: "workspace_formula_added_by_fkey",
    }).onDelete("set null"),
    primaryKey({
      columns: [table.workspace_id, table.formula_id],
      name: "workspace_formula_pkey",
    }),
  ]
);
