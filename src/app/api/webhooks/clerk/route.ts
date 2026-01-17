import { Webhook } from "svix";
import { headers } from "next/headers";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.SVIX_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "SVIX_SECRET not configured" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const payload = await req.text();
  const wh = new Webhook(secret);

  let msg: {
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ email_address: string }>;
      username?: string;
      first_name?: string;
      created_at?: number;
    };
  };

  try {
    msg = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof msg;
  } catch {
    console.error("[Webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = msg.type;
  const userData = msg.data;

  if (eventType === "user.created") {
    const email = userData.email_addresses?.[0]?.email_address || null;
    const clerkUserId = userData.id;
    const username = userData.username || userData.first_name || null;
    const createdAt = userData.created_at
      ? new Date(userData.created_at)
      : new Date();

    try {
      const result = await sql`
        INSERT INTO users (user_id, email, username, created_at)
        VALUES (${clerkUserId}, ${email}, ${username}, ${createdAt})
        ON CONFLICT (user_id) DO NOTHING
        RETURNING *
      `;
      console.log("[Webhook] User saved:", result[0]);
      return NextResponse.json(result[0], { status: 201 });
    } catch (dbErr) {
      console.error("[Webhook] DB error:", dbErr);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.deleted") {
    const clerkUserId = userData.id;

    try {
      const result = await sql`
        DELETE FROM users WHERE user_id = ${clerkUserId}
        RETURNING *
      `;
      console.log("[Webhook] User deleted:", result[0]);
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (dbErr) {
      console.error("[Webhook] DB error during deletion:", dbErr);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }
  }

  // For other event types, just acknowledge
  return NextResponse.json({ message: "Event ignored" }, { status: 200 });
}
