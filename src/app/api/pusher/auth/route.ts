import { NextRequest, NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { support_conversation } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Extract conversation ID from channel name (private-conversation-123)
    const match = channelName.match(/^private-conversation-(\d+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid channel" }, { status: 403 });
    }

    const conversationId = parseInt(match[1], 10);

    // Get the conversation
    const conversation = await db
      .select()
      .from(support_conversation)
      .where(eq(support_conversation.conversation_id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const conv = conversation[0];
    const session = await getSession();
    const userIsAdmin = await isAdmin();

    // Check authorization
    let authorized = false;

    // Admin can access any conversation
    if (userIsAdmin) {
      authorized = true;
    }
    // User can access their own conversation
    else if (session?.user && conv.user_id === session.user.id) {
      authorized = true;
    }
    // Guest can access via session ID (passed in headers or cookies)
    else if (conv.guest_session_id) {
      const guestSessionId = req.headers.get("x-guest-session-id");
      if (guestSessionId === conv.guest_session_id) {
        authorized = true;
      }
    }

    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate auth response
    const authResponse = pusherServer.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("[Pusher Auth] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
