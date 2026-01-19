"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { sendFlavourInviteEmail, sendFlavourShareNotification } from "@/lib/email/resend";

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

/**
 * Share a flavour with a user by email.
 * If user exists -> create direct share + send notification
 * If user doesn't exist -> create invite + send invitation email
 */
export async function shareFlavour(data: {
  flavourId: number;
  email: string;
  locale?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { flavourId, email, locale = "en" } = data;
  const normalizedEmail = email.toLowerCase().trim();

  // Verify ownership of the flavour
  const flavourCheck = await sql`
    SELECT f.flavour_id, f.name, f.user_id, u.username, u.email as owner_email
    FROM flavour f
    JOIN users u ON f.user_id = u.user_id
    WHERE f.flavour_id = ${flavourId} AND f.user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  const flavour = flavourCheck[0];
  const inviterName = flavour.username || flavour.owner_email || "Someone";

  // Prevent self-sharing
  if (normalizedEmail === flavour.owner_email?.toLowerCase()) {
    throw new Error("You cannot share with yourself");
  }

  // Check if user exists
  const existingUser = await sql`
    SELECT user_id, email, username FROM users
    WHERE LOWER(email) = ${normalizedEmail}
  `;

  if (existingUser.length > 0) {
    // User exists - create direct share
    const targetUser = existingUser[0];

    // Check if already shared
    const existingShare = await sql`
      SELECT share_id FROM flavour_shares
      WHERE flavour_id = ${flavourId} AND shared_with_user_id = ${targetUser.user_id}
    `;

    if (existingShare.length > 0) {
      throw new Error("Already shared with this user");
    }

    // Create share
    const result = await sql`
      INSERT INTO flavour_shares (flavour_id, shared_with_user_id, shared_by_user_id)
      VALUES (${flavourId}, ${targetUser.user_id}, ${userId})
      RETURNING *
    `;

    // Send notification email
    try {
      await sendFlavourShareNotification(
        targetUser.email,
        inviterName,
        flavour.name,
        flavourId,
        locale
      );
    } catch (emailError) {
      console.error("[shareFlavour] Failed to send notification email:", emailError);
    }

    return {
      type: "share" as const,
      share: result[0],
      user: {
        user_id: targetUser.user_id,
        email: targetUser.email,
        username: targetUser.username,
      },
    };
  } else {
    // User doesn't exist - create invite
    // Check if already invited
    const existingInvite = await sql`
      SELECT invite_id, status FROM flavour_invites
      WHERE flavour_id = ${flavourId} AND LOWER(invited_email) = ${normalizedEmail}
    `;

    if (existingInvite.length > 0) {
      if (existingInvite[0].status === "pending") {
        throw new Error("Already invited this email");
      }
      // If expired or accepted, allow re-invite by deleting old one
      await sql`
        DELETE FROM flavour_invites
        WHERE flavour_id = ${flavourId} AND LOWER(invited_email) = ${normalizedEmail}
      `;
    }

    // Create invite
    const result = await sql`
      INSERT INTO flavour_invites (flavour_id, invited_email, invited_by_user_id)
      VALUES (${flavourId}, ${normalizedEmail}, ${userId})
      RETURNING *
    `;

    const invite = result[0];

    // Send invitation email
    try {
      await sendFlavourInviteEmail(
        normalizedEmail,
        inviterName,
        flavour.name,
        invite.invite_token,
        locale
      );
    } catch (emailError) {
      console.error("[shareFlavour] Failed to send invite email:", emailError);
      // Don't throw - invite was created, email failure shouldn't block
    }

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

/**
 * Get all shares and pending invites for a flavour (owner only)
 */
export async function getFlavourShares(flavourId: number): Promise<(ShareInfo | InviteInfo)[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const flavourCheck = await sql`
    SELECT flavour_id FROM flavour
    WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  // Get direct shares
  const shares = await sql`
    SELECT fs.share_id, fs.shared_with_user_id, fs.created_at,
           u.email, u.username
    FROM flavour_shares fs
    JOIN users u ON fs.shared_with_user_id = u.user_id
    WHERE fs.flavour_id = ${flavourId}
    ORDER BY fs.created_at DESC
  `;

  // Get pending invites
  const invites = await sql`
    SELECT invite_id, invited_email, status, created_at
    FROM flavour_invites
    WHERE flavour_id = ${flavourId} AND status = 'pending'
    ORDER BY created_at DESC
  `;

  const shareInfos: ShareInfo[] = shares.map((s) => ({
    type: "share" as const,
    share_id: Number(s.share_id),
    user_id: String(s.shared_with_user_id),
    email: String(s.email),
    username: s.username ? String(s.username) : null,
    created_at: String(s.created_at),
  }));

  const inviteInfos: InviteInfo[] = invites.map((i) => ({
    type: "invite" as const,
    invite_id: Number(i.invite_id),
    email: String(i.invited_email),
    status: String(i.status),
    created_at: String(i.created_at),
  }));

  return [...shareInfos, ...inviteInfos];
}

/**
 * Revoke a share or cancel an invite
 */
export async function revokeShare(data: {
  flavourId: number;
  shareId?: number;
  inviteId?: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { flavourId, shareId, inviteId } = data;

  // Verify ownership
  const flavourCheck = await sql`
    SELECT flavour_id FROM flavour
    WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  if (shareId) {
    await sql`
      DELETE FROM flavour_shares
      WHERE share_id = ${shareId} AND flavour_id = ${flavourId}
    `;
  } else if (inviteId) {
    await sql`
      DELETE FROM flavour_invites
      WHERE invite_id = ${inviteId} AND flavour_id = ${flavourId}
    `;
  } else {
    throw new Error("Must provide either shareId or inviteId");
  }

  return { success: true };
}

/**
 * Get all flavours shared with the current user
 */
export async function getFlavoursSharedWithMe(): Promise<SharedFlavour[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const flavours = await sql`
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
  `;

  return flavours.map((f) => ({
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

/**
 * Accept an invite by token (called from invite page)
 */
export async function acceptInvite(token: string): Promise<{ flavourId: number }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized - please sign in first");

  // Get user's email
  const userResult = await sql`
    SELECT email FROM users WHERE user_id = ${userId}
  `;

  if (userResult.length === 0) {
    throw new Error("User not found");
  }

  const userEmail = userResult[0].email?.toLowerCase();

  // Find the invite
  const inviteResult = await sql`
    SELECT invite_id, flavour_id, invited_email, invited_by_user_id, status
    FROM flavour_invites
    WHERE invite_token = ${token}
  `;

  if (inviteResult.length === 0) {
    throw new Error("Invite not found or expired");
  }

  const invite = inviteResult[0];

  if (invite.status !== "pending") {
    throw new Error("This invite has already been used");
  }

  // Verify email matches (case-insensitive)
  if (invite.invited_email?.toLowerCase() !== userEmail) {
    throw new Error("This invite was sent to a different email address");
  }

  // Create the share
  await sql`
    INSERT INTO flavour_shares (flavour_id, shared_with_user_id, shared_by_user_id)
    VALUES (${invite.flavour_id}, ${userId}, ${invite.invited_by_user_id})
    ON CONFLICT (flavour_id, shared_with_user_id) DO NOTHING
  `;

  // Mark invite as accepted
  await sql`
    UPDATE flavour_invites
    SET status = 'accepted', accepted_at = NOW()
    WHERE invite_id = ${invite.invite_id}
  `;

  return { flavourId: Number(invite.flavour_id) };
}

/**
 * Get invite details by token (public, for invite page)
 */
export async function getInviteByToken(token: string) {
  const inviteResult = await sql`
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
  `;

  if (inviteResult.length === 0) {
    return null;
  }

  const invite = inviteResult[0];
  return {
    invite_id: Number(invite.invite_id),
    flavour_id: Number(invite.flavour_id),
    invited_email: String(invite.invited_email),
    status: String(invite.status),
    flavour_name: String(invite.flavour_name),
    inviter_name: invite.inviter_username || invite.inviter_email,
  };
}

/**
 * Convert pending invites to shares for a newly registered user
 * Called from Clerk webhook on user.created
 */
export async function convertPendingInvites(userEmail: string, newUserId: string) {
  const normalizedEmail = userEmail.toLowerCase();

  // Find all pending invites for this email
  const pendingInvites = await sql`
    SELECT invite_id, flavour_id, invited_by_user_id
    FROM flavour_invites
    WHERE LOWER(invited_email) = ${normalizedEmail} AND status = 'pending'
  `;

  if (pendingInvites.length === 0) {
    return { converted: 0 };
  }

  let converted = 0;

  for (const invite of pendingInvites) {
    try {
      // Create share
      await sql`
        INSERT INTO flavour_shares (flavour_id, shared_with_user_id, shared_by_user_id)
        VALUES (${invite.flavour_id}, ${newUserId}, ${invite.invited_by_user_id})
        ON CONFLICT (flavour_id, shared_with_user_id) DO NOTHING
      `;

      // Mark invite as accepted
      await sql`
        UPDATE flavour_invites
        SET status = 'accepted', accepted_at = NOW()
        WHERE invite_id = ${invite.invite_id}
      `;

      converted++;
    } catch (error) {
      console.error(`[convertPendingInvites] Failed to convert invite ${invite.invite_id}:`, error);
    }
  }

  console.log(`[convertPendingInvites] Converted ${converted} invites for ${normalizedEmail}`);
  return { converted };
}
