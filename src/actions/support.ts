"use server";

import { db } from "@/lib/db";
import { support_conversation, support_message, users } from "@/db/schema";
import { eq, and, desc, sql, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { requireAdmin } from "@/lib/admin";
import { sendSupportNotification } from "@/lib/email/resend";
import { z } from "zod";

// ============================================
// TYPES
// ============================================

export interface SupportMessage {
  message_id: number;
  conversation_id: number;
  sender_type: string;
  sender_user_id: string | null;
  content: string;
  created_at: string;
}

export interface SupportConversation {
  conversation_id: number;
  user_id: string | null;
  guest_email: string | null;
  guest_session_id: string | null;
  subject: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  has_unread_admin: boolean;
}

export interface AdminConversationListItem {
  conversation_id: number;
  user_id: string | null;
  guest_email: string | null;
  subject: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  has_unread_admin: boolean;
  user_email: string | null;
  user_name: string | null;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const sendMessageSchema = z.object({
  conversationId: z.number(),
  content: z.string().min(1).max(5000),
  senderType: z.enum(["user", "guest", "admin"]),
});

const guestEmailSchema = z.object({
  guestEmail: z.string().email().max(255),
});

// ============================================
// USER/GUEST ACTIONS
// ============================================

export async function getOrCreateConversation(input?: { guestEmail?: string }) {
  const session = await getSession();

  if (session?.user) {
    // Authenticated user - find or create conversation
    const existing = await db
      .select()
      .from(support_conversation)
      .where(
        and(
          eq(support_conversation.user_id, session.user.id),
          eq(support_conversation.status, "open")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const messages = await getConversationMessages(existing[0].conversation_id);
      return {
        success: true,
        conversationId: existing[0].conversation_id,
        guestSessionId: null,
        messages,
      };
    }

    // Create new conversation
    const [newConv] = await db
      .insert(support_conversation)
      .values({
        user_id: session.user.id,
        status: "open",
      })
      .returning();

    return {
      success: true,
      conversationId: newConv.conversation_id,
      guestSessionId: null,
      messages: [],
    };
  }

  // Guest user
  if (!input?.guestEmail) {
    return { success: false, error: "Email required for guest users" };
  }

  const validated = guestEmailSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid email" };
  }

  // Create new guest conversation
  const [newConv] = await db
    .insert(support_conversation)
    .values({
      guest_email: validated.data.guestEmail.toLowerCase().trim(),
      status: "open",
    })
    .returning();

  return {
    success: true,
    conversationId: newConv.conversation_id,
    guestSessionId: newConv.guest_session_id,
    messages: [],
  };
}

export async function getConversationByGuestSession(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: "Session ID required" };
  }

  const conversation = await db
    .select()
    .from(support_conversation)
    .where(eq(support_conversation.guest_session_id, sessionId))
    .limit(1);

  if (conversation.length === 0) {
    return { success: false, error: "Conversation not found" };
  }

  const messages = await getConversationMessages(conversation[0].conversation_id);
  return {
    success: true,
    conversationId: conversation[0].conversation_id,
    guestEmail: conversation[0].guest_email,
    messages,
  };
}

export async function getMyConversation() {
  const session = await getSession();

  if (!session?.user) {
    return { success: false, error: "Not authenticated" };
  }

  const conversation = await db
    .select()
    .from(support_conversation)
    .where(
      and(
        eq(support_conversation.user_id, session.user.id),
        eq(support_conversation.status, "open")
      )
    )
    .limit(1);

  if (conversation.length === 0) {
    return { success: true, conversation: null, messages: [] };
  }

  const messages = await getConversationMessages(conversation[0].conversation_id);
  return {
    success: true,
    conversation: conversation[0],
    messages,
  };
}

export async function sendSupportMessage(input: {
  conversationId: number;
  content: string;
  senderType: "user" | "guest" | "admin";
  guestSessionId?: string;
}) {
  const validated = sendMessageSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid message data" };
  }

  const { conversationId, content, senderType } = validated.data;
  const session = await getSession();

  // Verify access to this conversation
  const conversation = await db
    .select()
    .from(support_conversation)
    .where(eq(support_conversation.conversation_id, conversationId))
    .limit(1);

  if (conversation.length === 0) {
    return { success: false, error: "Conversation not found" };
  }

  const conv = conversation[0];

  // Verify user has access
  if (senderType === "user") {
    if (!session?.user || conv.user_id !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }
  } else if (senderType === "guest") {
    // For guests, verify session ID matches
    if (input.guestSessionId !== conv.guest_session_id) {
      return { success: false, error: "Unauthorized" };
    }
  } else if (senderType === "admin") {
    await requireAdmin();
  }

  // Insert message
  const [newMessage] = await db
    .insert(support_message)
    .values({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_user_id: session?.user?.id || null,
      content: content.trim(),
    })
    .returning();

  // Update conversation timestamp and unread flag
  await db
    .update(support_conversation)
    .set({
      updated_at: new Date().toISOString(),
      has_unread_admin: senderType !== "admin",
    })
    .where(eq(support_conversation.conversation_id, conversationId));

  // Send email notification to admin for new user/guest messages
  if (senderType !== "admin") {
    try {
      // Get user info if authenticated
      let senderInfo = conv.guest_email || "Guest";
      if (conv.user_id) {
        const userResult = await db
          .select({ email: users.email, name: users.name })
          .from(users)
          .where(eq(users.id, conv.user_id))
          .limit(1);
        if (userResult.length > 0) {
          senderInfo = userResult[0].email || userResult[0].name || conv.user_id;
        }
      }

      await sendSupportNotification({
        conversationId,
        senderInfo,
        messageContent: content,
        isGuest: !conv.user_id,
      });
    } catch (emailError) {
      console.error("[sendSupportMessage] Failed to send admin notification:", emailError);
    }
  }

  return {
    success: true,
    message: newMessage as SupportMessage,
  };
}

async function getConversationMessages(conversationId: number): Promise<SupportMessage[]> {
  const messages = await db
    .select()
    .from(support_message)
    .where(eq(support_message.conversation_id, conversationId))
    .orderBy(asc(support_message.created_at));

  return messages as SupportMessage[];
}

// ============================================
// ADMIN ACTIONS
// ============================================

export async function getAdminConversations(filters?: {
  status?: "open" | "closed" | "pending";
  unreadOnly?: boolean;
}): Promise<AdminConversationListItem[]> {
  await requireAdmin();

  const result = await db
    .select({
      conversation_id: support_conversation.conversation_id,
      user_id: support_conversation.user_id,
      guest_email: support_conversation.guest_email,
      subject: support_conversation.subject,
      status: support_conversation.status,
      created_at: support_conversation.created_at,
      updated_at: support_conversation.updated_at,
      has_unread_admin: support_conversation.has_unread_admin,
      user_email: users.email,
      user_name: users.name,
    })
    .from(support_conversation)
    .leftJoin(users, eq(support_conversation.user_id, users.id))
    .where(
      filters?.status && filters?.unreadOnly
        ? and(
            eq(support_conversation.status, filters.status),
            eq(support_conversation.has_unread_admin, true)
          )
        : filters?.status
          ? eq(support_conversation.status, filters.status)
          : filters?.unreadOnly
            ? eq(support_conversation.has_unread_admin, true)
            : undefined
    )
    .orderBy(desc(support_conversation.updated_at));

  return result;
}

export async function getAdminConversationDetail(conversationId: number) {
  await requireAdmin();

  const conversation = await db
    .select({
      conversation: support_conversation,
      user_email: users.email,
      user_name: users.name,
    })
    .from(support_conversation)
    .leftJoin(users, eq(support_conversation.user_id, users.id))
    .where(eq(support_conversation.conversation_id, conversationId))
    .limit(1);

  if (conversation.length === 0) {
    return { success: false, error: "Conversation not found" };
  }

  const messages = await getConversationMessages(conversationId);

  // Mark as read by admin
  await db
    .update(support_conversation)
    .set({
      has_unread_admin: false,
      last_admin_read_at: new Date().toISOString(),
    })
    .where(eq(support_conversation.conversation_id, conversationId));

  return {
    success: true,
    conversation: conversation[0].conversation,
    user: {
      email: conversation[0].user_email,
      name: conversation[0].user_name,
    },
    messages,
  };
}

export async function sendAdminReply(conversationId: number, content: string) {
  await requireAdmin();

  return sendSupportMessage({
    conversationId,
    content,
    senderType: "admin",
  });
}

export async function updateConversationStatus(
  conversationId: number,
  status: "open" | "closed" | "pending"
) {
  await requireAdmin();

  await db
    .update(support_conversation)
    .set({
      status,
      closed_at: status === "closed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(support_conversation.conversation_id, conversationId));

  return { success: true };
}

export async function getUnreadConversationCount(): Promise<number> {
  await requireAdmin();

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(support_conversation)
    .where(eq(support_conversation.has_unread_admin, true));

  return result[0]?.count || 0;
}

// Polling endpoint - gets messages newer than a timestamp
export async function pollMessages(
  conversationId: number,
  lastMessageId: number,
  guestSessionId?: string
) {
  const session = await getSession();

  // Verify access
  const conversation = await db
    .select()
    .from(support_conversation)
    .where(eq(support_conversation.conversation_id, conversationId))
    .limit(1);

  if (conversation.length === 0) {
    return { success: false, error: "Conversation not found" };
  }

  const conv = conversation[0];

  // Check authorization
  if (conv.user_id) {
    if (!session?.user || conv.user_id !== session.user.id) {
      // Check if admin
      try {
        await requireAdmin();
      } catch {
        return { success: false, error: "Unauthorized" };
      }
    }
  } else if (conv.guest_session_id) {
    if (guestSessionId !== conv.guest_session_id) {
      // Check if admin
      try {
        await requireAdmin();
      } catch {
        return { success: false, error: "Unauthorized" };
      }
    }
  }

  const newMessages = await db
    .select()
    .from(support_message)
    .where(
      and(
        eq(support_message.conversation_id, conversationId),
        sql`${support_message.message_id} > ${lastMessageId}`
      )
    )
    .orderBy(asc(support_message.created_at));

  return {
    success: true,
    messages: newMessages as SupportMessage[],
  };
}
