"use server";

import { getUserId } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formula, formula_shares, formula_invites, users, substance_formula } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendFormulaInviteEmail, sendFormulaShareNotification, sendShareAdminNotification } from "@/lib/email/resend";
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

export interface SharedFormula {
  formula_id: number;
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

export async function shareFormula(data: {
  formulaId: number;
  email: string;
  locale?: string;
}) {
  const userId = await getUserId();

  const { formulaId, email, locale = "en" } = data;
  const normalizedEmail = email.toLowerCase().trim();

  const formulaCheck = await db.execute(sql`
    SELECT f.formula_id, f.name, f.user_id, u.username, u.email as owner_email
    FROM formula f
    JOIN users u ON f.user_id = u.user_id
    WHERE f.formula_id = ${formulaId} AND f.user_id = ${userId}
  `);

  if (formulaCheck.rows.length === 0) {
    throw new Error("Formula not found or you don't own it");
  }

  const formulaData = formulaCheck.rows[0] as Record<string, unknown>;
  const inviterName = String(formulaData.username || formulaData.owner_email || "Someone");

  if (normalizedEmail === String(formulaData.owner_email).toLowerCase()) {
    throw new Error("You cannot share with yourself");
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (existingUser.length > 0) {
    const targetUser = existingUser[0];

    const existingShare = await db
      .select({ share_id: formula_shares.share_id })
      .from(formula_shares)
      .where(
        and(
          eq(formula_shares.formula_id, formulaId),
          eq(formula_shares.shared_with_user_id, targetUser.id)
        )
      );

    if (existingShare.length > 0) {
      throw new Error("Already shared with this user");
    }

    const result = await db
      .insert(formula_shares)
      .values({
        formula_id: formulaId,
        shared_with_user_id: targetUser.id,
        shared_by_user_id: userId,
      })
      .returning();

    try {
      await sendFormulaShareNotification(
        targetUser.email!,
        inviterName,
        String(formulaData.name),
        formulaId,
        locale
      );
    } catch (emailError) {
      console.error("[shareFormula] Failed to send notification email:", emailError);
    }

    try {
      await sendShareAdminNotification({
        sharerEmail: String(formulaData.owner_email),
        sharerName: inviterName,
        recipientEmail: targetUser.email!,
        formulaName: String(formulaData.name),
        isNewUser: false,
      });
    } catch (adminEmailError) {
      console.error("[shareFormula] Failed to send admin notification:", adminEmailError);
    }

    // Track formula share in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "formula_shared",
      properties: {
        formula_id: formulaId,
        formula_name: String(formulaData.name),
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
      .select({ invite_id: formula_invites.invite_id, status: formula_invites.status })
      .from(formula_invites)
      .where(
        and(
          eq(formula_invites.formula_id, formulaId),
          eq(formula_invites.invited_email, normalizedEmail)
        )
      );

    if (existingInvite.length > 0) {
      if (existingInvite[0].status === "pending") {
        throw new Error("Already invited this email");
      }
      await db
        .delete(formula_invites)
        .where(
          and(
            eq(formula_invites.formula_id, formulaId),
            eq(formula_invites.invited_email, normalizedEmail)
          )
        );
    }

    const result = await db
      .insert(formula_invites)
      .values({
        formula_id: formulaId,
        invited_email: normalizedEmail,
        invited_by_user_id: userId,
      })
      .returning();

    const invite = result[0];

    try {
      await sendFormulaInviteEmail(
        normalizedEmail,
        inviterName,
        String(formulaData.name),
        invite.invite_token!,
        locale
      );
    } catch (emailError) {
      console.error("[shareFormula] Failed to send invite email:", emailError);
    }

    try {
      await sendShareAdminNotification({
        sharerEmail: String(formulaData.owner_email),
        sharerName: inviterName,
        recipientEmail: normalizedEmail,
        formulaName: String(formulaData.name),
        isNewUser: true,
      });
    } catch (adminEmailError) {
      console.error("[shareFormula] Failed to send admin notification:", adminEmailError);
    }

    // Track formula invite in PostHog
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "formula_shared",
      properties: {
        formula_id: formulaId,
        formula_name: String(formulaData.name),
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

export async function getFormulaShares(formulaId: number): Promise<(ShareInfo | InviteInfo)[]> {
  const userId = await getUserId();

  const formulaCheck = await db
    .select({ formula_id: formula.formula_id })
    .from(formula)
    .where(and(eq(formula.formula_id, formulaId), eq(formula.user_id, userId)));

  if (formulaCheck.length === 0) {
    throw new Error("Formula not found or you don't own it");
  }

  const shares = await db.execute(sql`
    SELECT fs.share_id, fs.shared_with_user_id, fs.created_at,
           u.email, u.username
    FROM formula_shares fs
    JOIN users u ON fs.shared_with_user_id = u.user_id
    WHERE fs.formula_id = ${formulaId}
    ORDER BY fs.created_at DESC
  `);

  const invites = await db
    .select()
    .from(formula_invites)
    .where(
      and(
        eq(formula_invites.formula_id, formulaId),
        eq(formula_invites.status, "pending")
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
  formulaId: number;
  shareId?: number;
  inviteId?: number;
}) {
  const userId = await getUserId();

  const { formulaId, shareId, inviteId } = data;

  const formulaCheck = await db
    .select({ formula_id: formula.formula_id })
    .from(formula)
    .where(and(eq(formula.formula_id, formulaId), eq(formula.user_id, userId)));

  if (formulaCheck.length === 0) {
    throw new Error("Formula not found or you don't own it");
  }

  if (shareId) {
    await db
      .delete(formula_shares)
      .where(
        and(
          eq(formula_shares.share_id, shareId),
          eq(formula_shares.formula_id, formulaId)
        )
      );
  } else if (inviteId) {
    await db
      .delete(formula_invites)
      .where(
        and(
          eq(formula_invites.invite_id, inviteId),
          eq(formula_invites.formula_id, formulaId)
        )
      );
  } else {
    throw new Error("Must provide either shareId or inviteId");
  }

  return { success: true };
}

export async function getFormulasSharedWithMe(): Promise<SharedFormula[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.formula_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.created_at,
      fs.created_at as shared_at,
      u.username as shared_by_username,
      u.email as shared_by_email,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM formula_shares fs
    JOIN formula f ON fs.formula_id = f.formula_id
    JOIN users u ON fs.shared_by_user_id = u.user_id
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    WHERE fs.shared_with_user_id = ${userId}
    ORDER BY fs.created_at DESC
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
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

export async function acceptInvite(token: string): Promise<{ formulaId: number }> {
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
    .from(formula_invites)
    .where(eq(formula_invites.invite_token, token));

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

  const formulaOwner = await db
    .select({ user_id: formula.user_id })
    .from(formula)
    .where(eq(formula.formula_id, invite.formula_id));

  if (formulaOwner.length > 0 && formulaOwner[0].user_id === userId) {
    throw new Error("You cannot accept an invite to your own formula");
  }

  await db.execute(sql`
    INSERT INTO formula_shares (formula_id, shared_with_user_id, shared_by_user_id)
    VALUES (${invite.formula_id}, ${userId}, ${invite.invited_by_user_id})
    ON CONFLICT (formula_id, shared_with_user_id) DO NOTHING
  `);

  await db
    .update(formula_invites)
    .set({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .where(eq(formula_invites.invite_id, invite.invite_id));

  // Track invite acceptance in PostHog
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "share_invite_accepted",
    properties: {
      formula_id: invite.formula_id,
      invited_by_user_id: invite.invited_by_user_id,
    },
  });

  return { formulaId: invite.formula_id };
}

export async function getInviteByToken(token: string) {
  const result = await db.execute(sql`
    SELECT
      fi.invite_id,
      fi.formula_id,
      fi.invited_email,
      fi.status,
      f.name as formula_name,
      u.username as inviter_username,
      u.email as inviter_email
    FROM formula_invites fi
    JOIN formula f ON fi.formula_id = f.formula_id
    JOIN users u ON fi.invited_by_user_id = u.user_id
    WHERE fi.invite_token = ${token}
  `);

  if (result.rows.length === 0) {
    return null;
  }

  const invite = result.rows[0] as Record<string, unknown>;
  return {
    invite_id: Number(invite.invite_id),
    formula_id: Number(invite.formula_id),
    invited_email: String(invite.invited_email),
    status: String(invite.status),
    formula_name: String(invite.formula_name),
    inviter_name: String(invite.inviter_username || invite.inviter_email || "Unknown"),
  };
}

export async function convertPendingInvites(userEmail: string, newUserId: string) {
  const normalizedEmail = userEmail.toLowerCase();

  const pendingInvites = await db
    .select()
    .from(formula_invites)
    .where(
      and(
        eq(formula_invites.invited_email, normalizedEmail),
        eq(formula_invites.status, "pending")
      )
    );

  if (pendingInvites.length === 0) {
    return { converted: 0 };
  }

  let converted = 0;

  for (const invite of pendingInvites) {
    try {
      await db.execute(sql`
        INSERT INTO formula_shares (formula_id, shared_with_user_id, shared_by_user_id)
        VALUES (${invite.formula_id}, ${newUserId}, ${invite.invited_by_user_id})
        ON CONFLICT (formula_id, shared_with_user_id) DO NOTHING
      `);

      await db
        .update(formula_invites)
        .set({
          status: "accepted",
          accepted_at: new Date().toISOString(),
        })
        .where(eq(formula_invites.invite_id, invite.invite_id));

      converted++;
    } catch (error) {
      console.error(`[convertPendingInvites] Failed to convert invite ${invite.invite_id}:`, error);
    }
  }

  console.log(`[convertPendingInvites] Converted ${converted} invites for ${normalizedEmail}`);
  return { converted };
}
