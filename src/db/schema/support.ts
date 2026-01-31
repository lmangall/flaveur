import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
  foreignKey,
  check,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./user";

// Support conversation table - tracks helpdesk conversations
export const support_conversation = pgTable(
  "support_conversation",
  {
    conversation_id: serial().primaryKey().notNull(),
    // For authenticated users - nullable for guests
    user_id: varchar({ length: 255 }),
    // For guests - required if user_id is null
    guest_email: varchar({ length: 255 }),
    guest_session_id: uuid().defaultRandom(), // For localStorage continuity
    // Conversation metadata
    subject: varchar({ length: 255 }),
    status: varchar({ length: 20 }).default("open").notNull(),
    // Timestamps
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    updated_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
    closed_at: timestamp({ mode: "string" }),
    // Admin tracking
    has_unread_admin: boolean().default(true).notNull(), // New user messages unread by admin
    last_admin_read_at: timestamp({ mode: "string" }),
    // Typing indicators
    user_typing_at: timestamp({ mode: "string" }),
    admin_typing_at: timestamp({ mode: "string" }),
  },
  (table) => [
    index("idx_support_conversation_user_id").using(
      "btree",
      table.user_id.asc().nullsLast().op("text_ops")
    ),
    index("idx_support_conversation_guest_email").using(
      "btree",
      table.guest_email.asc().nullsLast().op("text_ops")
    ),
    index("idx_support_conversation_guest_session").using(
      "btree",
      table.guest_session_id.asc().nullsLast().op("uuid_ops")
    ),
    index("idx_support_conversation_status").using(
      "btree",
      table.status.asc().nullsLast().op("text_ops")
    ),
    index("idx_support_conversation_has_unread").using(
      "btree",
      table.has_unread_admin.asc().nullsLast().op("bool_ops")
    ),
    foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
      name: "support_conversation_user_id_fkey",
    }).onDelete("set null"), // Keep conversation even if user deleted
    check(
      "support_conversation_status_check",
      sql`(status)::text = ANY (ARRAY['open'::text, 'closed'::text, 'pending'::text])`
    ),
  ]
);

// Support message table - individual messages in a conversation
export const support_message = pgTable(
  "support_message",
  {
    message_id: serial().primaryKey().notNull(),
    conversation_id: integer().notNull(),
    // Sender info
    sender_type: varchar({ length: 20 }).notNull(), // 'user' | 'guest' | 'admin'
    sender_user_id: varchar({ length: 255 }), // For authenticated users/admin
    // Message content
    content: text().notNull(),
    // Timestamps
    created_at: timestamp({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_support_message_conversation_id").using(
      "btree",
      table.conversation_id.asc().nullsLast().op("int4_ops")
    ),
    index("idx_support_message_created_at").using(
      "btree",
      table.created_at.asc().nullsLast()
    ),
    foreignKey({
      columns: [table.conversation_id],
      foreignColumns: [support_conversation.conversation_id],
      name: "support_message_conversation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.sender_user_id],
      foreignColumns: [users.id],
      name: "support_message_sender_user_id_fkey",
    }).onDelete("set null"),
    check(
      "support_message_sender_type_check",
      sql`(sender_type)::text = ANY (ARRAY['user'::text, 'guest'::text, 'admin'::text])`
    ),
  ]
);
