"use server";

import { getUserId } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { flavour, flavour_shares, flavour_invites, users, substance_flavour } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendFlavourInviteEmail, sendFlavourShareNotification, sendShareAdminNotification } from "@/lib/email/resend";
import { getPostHogClient } from "@/lib/posthog-server";

// Types
export interface ShareInfo {
  type: "share";
  share_id: number;
  user_id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export interface InviteInfo {
  type: "invite";
  invite_id: number;
  email: string;
  status: string;
  created_at: string;
}

export interface SharedFlavour {
  flavour_id: number;
  name: string;
  description: string | null;
  status: string;
  updated_at: string;
  created_at: string;
  substance_count: number;
  shared_at: string;
  shared_by: {
    username: string | null;
    email: string;
  };
}

export async function shareFlavour(data: {
  flavourId: number;
  email: string;
  locale?: string;
}) {
  const userId = await getUserId();

  const { flavourId, email, locale = "en" } = data;
  const normalizedEmail = email.toLowerCase().trim();

  const flavourCheck = await db.execute(sql`
    SELECT f.flavour_id, f.name, f.user_id, u.username, u.email as owner_email
    FROM flavour f
    JOIN users u ON f.user_id = u.user_id
    WHERE f.flavour_id = ${flavourId} AND f.user_id = ${userId}
  `);

  if (flavourCheck.rows.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  const flavourData = flavourCheck.rows[0] as Record<string, unknown>;
  const inviterName = String(flavourData.username || flavourData.owner_email || "Someone");

  if (normalizedEmail === String(flavourData.owner_email).toLowerCase()) {
    throw new Error("You cannot share with yourself");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (existingUser.length > 0) {
    const targetUser = existingUser[0];

    const existingShare = await db
      .select({ share_id: flavour_shares.share_id })
      .from(flavour_shares)
      .where(
        and(
          eq(flavour_shares.flavour_id, flavourId),
          eq(flavour_shares.shared_with_user_id, targetUser.id)
        )
      );

    if (existingShare.length > 0) {
      throw new Error("Already shared with this user");
    }

    const result = await db
      .insert(flavour_shares)
      .values({
        flavour_id: flavourId,
        shared_with_user_id: targetUser.id,
        shared_by_user_id: userId,
      })
      .returning();

    try {
      await sendFlavourShareNotification(
        targetUser.email!,
        inviterName,
        String(flavourData.name),
        flavourId,
        locale
      );
    } catch (emailError) {
      console.error("[shareFlavour] Failed to send notification email:", emailError);
    }

    try {
      await sendShareAdminNotification({
        sharerEmail: String(flavourData.owner_email),
        sharerName: inviterName,
        recipientEmail: targetUser.email!,
        flavourName: String(flavourData.name),
        isNewUser: false,
      });
    } catch (adminEmailError) {
      console.error("[shareFlavour] Failed to send admin notification:", adminEmailError);
    }

    // Track flavour share in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "flavour_shared",
      properties: {
        flavour_id: flavourId,
        flavour_name: String(flavourData.name),
        recipient_type: "existing_user",
      },
    });

    return {
      type: "share" as const,
      share: result[0],
      user: {
        user_id: targetUser.id,
        email: targetUser.email,
        username: targetUser.name,
      },
    };
  } else {
    const existingInvite = await db
      .select({ invite_id: flavour_invites.invite_id, status: flavour_invites.status })
      .from(flavour_invites)
      .where(
        and(
          eq(flavour_invites.flavour_id, flavourId),
          eq(flavour_invites.invited_email, normalizedEmail)
        )
      );

    if (existingInvite.length > 0) {
      if (existingInvite[0].status === "pending") {
        throw new Error("Already invited this email");
      }
      await db
        .delete(flavour_invites)
        .where(
          and(
            eq(flavour_invites.flavour_id, flavourId),
            eq(flavour_invites.invited_email, normalizedEmail)
          )
        );
    }

    const result = await db
      .insert(flavour_invites)
      .values({
        flavour_id: flavourId,
        invited_email: normalizedEmail,
        invited_by_user_id: userId,
      })
      .returning();

    const invite = result[0];

    try {
      await sendFlavourInviteEmail(
        normalizedEmail,
        inviterName,
        String(flavourData.name),
        invite.invite_token!,
        locale
      );
    } catch (emailError) {
      console.error("[shareFlavour] Failed to send invite email:", emailError);
    }

    try {
      await sendShareAdminNotification({
        sharerEmail: String(flavourData.owner_email),
        sharerName: inviterName,
        recipientEmail: normalizedEmail,
        flavourName: String(flavourData.name),
        isNewUser: true,
      });
    } catch (adminEmailError) {
      console.error("[shareFlavour] Failed to send admin notification:", adminEmailError);
    }

    // Track flavour invite in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "flavour_shared",
      properties: {
        flavour_id: flavourId,
        flavour_name: String(flavourData.name),
        recipient_type: "new_user_invite",
      },
    });

    return {
      type: "invite" as const,
      invite: {
        invite_id: invite.invite_id,
        email: normalizedEmail,
        status: invite.status,
      },
    };
  }
}

export async function getFlavourShares(flavourId: number): Promise<(ShareInfo | InviteInfo)[]> {
  const userId = await getUserId();

  const flavourCheck = await db
    .select({ flavour_id: flavour.flavour_id })
    .from(flavour)
    .where(and(eq(flavour.flavour_id, flavourId), eq(flavour.user_id, userId)));

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  const shares = await db.execute(sql`
    SELECT fs.share_id, fs.shared_with_user_id, fs.created_at,
           u.email, u.username
    FROM flavour_shares fs
    JOIN users u ON fs.shared_with_user_id = u.user_id
    WHERE fs.flavour_id = ${flavourId}
    ORDER BY fs.created_at DESC
  `);

  const invites = await db
    .select()
    .from(flavour_invites)
    .where(
      and(
        eq(flavour_invites.flavour_id, flavourId),
        eq(flavour_invites.status, "pending")
      )
    );

  const shareInfos: ShareInfo[] = (shares.rows as Record<string, unknown>[]).map((s) => ({
    type: "share" as const,
    share_id: Number(s.share_id),
    user_id: String(s.shared_with_user_id),
    email: String(s.email),
    username: s.username ? String(s.username) : null,
    created_at: String(s.created_at),
  }));

  const inviteInfos: InviteInfo[] = invites.map((i) => ({
    type: "invite" as const,
    invite_id: i.invite_id,
    email: i.invited_email,
    status: i.status,
    created_at: i.created_at!,
  }));

  return [...shareInfos, ...inviteInfos];
}

export async function revokeShare(data: {
  flavourId: number;
  shareId?: number;
  inviteId?: number;
}) {
  const userId = await getUserId();

  const { flavourId, shareId, inviteId } = data;

  const flavourCheck = await db
    .select({ flavour_id: flavour.flavour_id })
    .from(flavour)
    .where(and(eq(flavour.flavour_id, flavourId), eq(flavour.user_id, userId)));

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  if (shareId) {
    await db
      .delete(flavour_shares)
      .where(
        and(
          eq(flavour_shares.share_id, shareId),
          eq(flavour_shares.flavour_id, flavourId)
        )
      );
  } else if (inviteId) {
    await db
      .delete(flavour_invites)
      .where(
        and(
          eq(flavour_invites.invite_id, inviteId),
          eq(flavour_invites.flavour_id, flavourId)
        )
      );
  } else {
    throw new Error("Must provide either shareId or inviteId");
  }

  return { success: true };
}

export async function getFlavoursSharedWithMe(): Promise<SharedFlavour[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.created_at,
      fs.created_at as shared_at,
      u.username as shared_by_username,
      u.email as shared_by_email,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM flavour_shares fs
    JOIN flavour f ON fs.flavour_id = f.flavour_id
    JOIN users u ON fs.shared_by_user_id = u.user_id
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    WHERE fs.shared_with_user_id = ${userId}
    ORDER BY fs.created_at DESC
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    status: String(f.status),
    updated_at: String(f.updated_at),
    created_at: String(f.created_at),
    substance_count: Number(f.substance_count) || 0,
    shared_at: String(f.shared_at),
    shared_by: {
      username: f.shared_by_username ? String(f.shared_by_username) : null,
      email: String(f.shared_by_email),
    },
  }));
}

export async function acceptInvite(token: string): Promise<{ flavourId: number }> {
  const userId = await getUserId();

  const userResult = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId));

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const userEmail = userResult[0].email?.toLowerCase();

  const inviteResult = await db
    .select()
    .from(flavour_invites)
    .where(eq(flavour_invites.invite_token, token));

  if (inviteResult.length === 0) {
    throw new Error("Invite not found or expired");
  }

  const invite = inviteResult[0];

  if (invite.status !== "pending") {
    throw new Error("This invite has already been used");
  }

  if (invite.invited_email.toLowerCase() !== userEmail) {
    throw new Error("This invite was sent to a different email address");
  }

  const flavourOwner = await db
    .select({ user_id: flavour.user_id })
    .from(flavour)
    .where(eq(flavour.flavour_id, invite.flavour_id));

  if (flavourOwner.length > 0 && flavourOwner[0].user_id === userId) {
    throw new Error("You cannot accept an invite to your own flavour");
  }

  await db.execute(sql`
    INSERT INTO flavour_shares (flavour_id, shared_with_user_id, shared_by_user_id)
    VALUES (${invite.flavour_id}, ${userId}, ${invite.invited_by_user_id})
    ON CONFLICT (flavour_id, shared_with_user_id) DO NOTHING
  `);

  await db
    .update(flavour_invites)
    .set({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .where(eq(flavour_invites.invite_id, invite.invite_id));

  // Track invite acceptance in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "share_invite_accepted",
    properties: {
      flavour_id: invite.flavour_id,
      invited_by_user_id: invite.invited_by_user_id,
    },
  });

  return { flavourId: invite.flavour_id };
}

export async function getInviteByToken(token: string) {
  const result = await db.execute(sql`
    SELECT
      fi.invite_id,
      fi.flavour_id,
      fi.invited_email,
      fi.status,
      f.name as flavour_name,
      u.username as inviter_username,
      u.email as inviter_email
    FROM flavour_invites fi
    JOIN flavour f ON fi.flavour_id = f.flavour_id
    JOIN users u ON fi.invited_by_user_id = u.user_id
    WHERE fi.invite_token = ${token}
  `);

  if (result.rows.length === 0) {
    return null;
  }

  const invite = result.rows[0] as Record<string, unknown>;
  return {
    invite_id: Number(invite.invite_id),
    flavour_id: Number(invite.flavour_id),
    invited_email: String(invite.invited_email),
    status: String(invite.status),
    flavour_name: String(invite.flavour_name),
    inviter_name: String(invite.inviter_username || invite.inviter_email || "Unknown"),
  };
}

export async function convertPendingInvites(userEmail: string, newUserId: string) {
  const normalizedEmail = userEmail.toLowerCase();

  const pendingInvites = await db
    .select()
    .from(flavour_invites)
    .where(
      and(
        eq(flavour_invites.invited_email, normalizedEmail),
        eq(flavour_invites.status, "pending")
      )
    );

  if (pendingInvites.length === 0) {
    return { converted: 0 };
  }

  let converted = 0;

  for (const invite of pendingInvites) {
    try {
      await db.execute(sql`
        INSERT INTO flavour_shares (flavour_id, shared_with_user_id, shared_by_user_id)
        VALUES (${invite.flavour_id}, ${newUserId}, ${invite.invited_by_user_id})
        ON CONFLICT (flavour_id, shared_with_user_id) DO NOTHING
      `);

      await db
        .update(flavour_invites)
        .set({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .where(eq(flavour_invites.invite_id, invite.invite_id));

      converted++;
    } catch (error) {
      console.error(`[convertPendingInvites] Failed to convert invite ${invite.invite_id}:`, error);
    }
  }

  console.log(`[convertPendingInvites] Converted ${converted} invites for ${normalizedEmail}`);
  return { converted };
}
