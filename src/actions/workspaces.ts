"use server";

import { getUserId, getSession } from "@/lib/auth-server";
import { sql } from "@/lib/db";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceInvite,
  WorkspaceFlavour,
  Flavour,
} from "@/app/type";
import type { WorkspaceRoleValue } from "@/constants";

// ===========================================
// WORKSPACE CRUD
// ===========================================

/**
 * Create a new workspace. The creator is automatically added as owner.
 */
export async function createWorkspace(data: {
  name: string;
  description?: string;
}): Promise<Workspace> {
  const userId = await getUserId();

  const { name, description } = data;

  if (!name.trim()) {
    throw new Error("Workspace name is required");
  }

  // Create workspace
  const workspaceResult = await sql`
    INSERT INTO workspace (name, description, created_by)
    VALUES (${name.trim()}, ${description?.trim() || null}, ${userId})
    RETURNING *
  `;

  const workspace = workspaceResult[0];

  // Add creator as owner
  await sql`
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (${workspace.workspace_id}, ${userId}, 'owner')
  `;

  return {
    workspace_id: Number(workspace.workspace_id),
    name: String(workspace.name),
    description: workspace.description ? String(workspace.description) : null,
    created_by: String(workspace.created_by),
    created_at: String(workspace.created_at),
    updated_at: String(workspace.updated_at),
  };
}

/**
 * Get all workspaces the current user is a member of.
 */
export async function getMyWorkspaces(): Promise<
  (Workspace & { role: WorkspaceRoleValue; member_count: number })[]
> {
  const userId = await getUserId();

  const workspaces = await sql`
    SELECT
      w.*,
      wm.role,
      COALESCE(mc.member_count, 0) as member_count
    FROM workspace w
    JOIN workspace_member wm ON w.workspace_id = wm.workspace_id
    LEFT JOIN (
      SELECT workspace_id, COUNT(*) as member_count
      FROM workspace_member
      GROUP BY workspace_id
    ) mc ON w.workspace_id = mc.workspace_id
    WHERE wm.user_id = ${userId}
    ORDER BY w.updated_at DESC
  `;

  return workspaces.map((w) => ({
    workspace_id: Number(w.workspace_id),
    name: String(w.name),
    description: w.description ? String(w.description) : null,
    created_by: String(w.created_by),
    created_at: String(w.created_at),
    updated_at: String(w.updated_at),
    role: String(w.role) as WorkspaceRoleValue,
    member_count: Number(w.member_count),
  }));
}

/**
 * Get a workspace by ID with members and role check.
 */
export async function getWorkspaceById(workspaceId: number): Promise<
  | (Workspace & {
      role: WorkspaceRoleValue;
      members: (WorkspaceMember & { email: string; username: string | null })[];
    })
  | null
> {
  const userId = await getUserId();

  // Get workspace and verify membership
  const workspaceResult = await sql`
    SELECT
      w.*,
      wm.role
    FROM workspace w
    JOIN workspace_member wm ON w.workspace_id = wm.workspace_id
    WHERE w.workspace_id = ${workspaceId} AND wm.user_id = ${userId}
  `;

  if (workspaceResult.length === 0) {
    return null;
  }

  const w = workspaceResult[0];

  // Get all members
  const members = await sql`
    SELECT
      wm.*,
      u.email,
      u.username
    FROM workspace_member wm
    JOIN users u ON wm.user_id = u.user_id
    WHERE wm.workspace_id = ${workspaceId}
    ORDER BY
      CASE wm.role
        WHEN 'owner' THEN 1
        WHEN 'editor' THEN 2
        WHEN 'viewer' THEN 3
      END,
      wm.created_at ASC
  `;

  return {
    workspace_id: Number(w.workspace_id),
    name: String(w.name),
    description: w.description ? String(w.description) : null,
    created_by: String(w.created_by),
    created_at: String(w.created_at),
    updated_at: String(w.updated_at),
    role: String(w.role) as WorkspaceRoleValue,
    members: members.map((m) => ({
      member_id: Number(m.member_id),
      workspace_id: Number(m.workspace_id),
      user_id: String(m.user_id),
      role: String(m.role) as WorkspaceRoleValue,
      created_at: String(m.created_at),
      email: String(m.email),
      username: m.username ? String(m.username) : null,
    })),
  };
}

/**
 * Update workspace details. Owner only.
 */
export async function updateWorkspace(data: {
  workspaceId: number;
  name?: string;
  description?: string;
}): Promise<Workspace> {
  const userId = await getUserId();

  const { workspaceId, name, description } = data;

  // Verify owner role
  const roleCheck = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (roleCheck.length === 0 || roleCheck[0].role !== "owner") {
    throw new Error("Only workspace owners can update workspace settings");
  }

  const result = await sql`
    UPDATE workspace
    SET
      name = COALESCE(${name?.trim()}, name),
      description = COALESCE(${description?.trim()}, description),
      updated_at = NOW()
    WHERE workspace_id = ${workspaceId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Workspace not found");
  }

  const w = result[0];
  return {
    workspace_id: Number(w.workspace_id),
    name: String(w.name),
    description: w.description ? String(w.description) : null,
    created_by: String(w.created_by),
    created_at: String(w.created_at),
    updated_at: String(w.updated_at),
  };
}

/**
 * Delete a workspace. Owner only.
 */
export async function deleteWorkspace(workspaceId: number): Promise<void> {
  const userId = await getUserId();

  // Verify owner role
  const roleCheck = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (roleCheck.length === 0 || roleCheck[0].role !== "owner") {
    throw new Error("Only workspace owners can delete workspaces");
  }

  // Note: CASCADE will delete members, documents, invites, and flavour links
  await sql`
    DELETE FROM workspace WHERE workspace_id = ${workspaceId}
  `;
}

// ===========================================
// MEMBER MANAGEMENT
// ===========================================

/**
 * Add a member to workspace by email.
 * If user exists -> add directly
 * If user doesn't exist -> create invite
 */
export async function addWorkspaceMember(data: {
  workspaceId: number;
  email: string;
  role: WorkspaceRoleValue;
}): Promise<{ type: "member" | "invite"; email: string }> {
  const userId = await getUserId();

  const { workspaceId, email, role } = data;
  const normalizedEmail = email.toLowerCase().trim();

  // Verify caller has permission (owner can add any role, editor can only add viewers)
  const callerRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (callerRole.length === 0) {
    throw new Error("Workspace not found or you are not a member");
  }

  const callerRoleValue = callerRole[0].role;

  if (callerRoleValue === "viewer") {
    throw new Error("Viewers cannot add members");
  }

  if (callerRoleValue === "editor" && role !== "viewer") {
    throw new Error("Editors can only invite viewers");
  }

  // Cannot add owner role via invite
  if (role === "owner") {
    throw new Error("Cannot add members with owner role");
  }

  // Check if user exists
  const existingUser = await sql`
    SELECT user_id, email FROM users
    WHERE LOWER(email) = ${normalizedEmail}
  `;

  if (existingUser.length > 0) {
    const targetUser = existingUser[0];

    // Check if already a member
    const existingMember = await sql`
      SELECT member_id FROM workspace_member
      WHERE workspace_id = ${workspaceId} AND user_id = ${targetUser.user_id}
    `;

    if (existingMember.length > 0) {
      throw new Error("User is already a member of this workspace");
    }

    // Add member directly
    await sql`
      INSERT INTO workspace_member (workspace_id, user_id, role)
      VALUES (${workspaceId}, ${targetUser.user_id}, ${role})
    `;

    return { type: "member", email: normalizedEmail };
  } else {
    // Create invite for non-user
    // Check if already invited
    const existingInvite = await sql`
      SELECT invite_id, status FROM workspace_invite
      WHERE workspace_id = ${workspaceId} AND LOWER(invited_email) = ${normalizedEmail}
    `;

    if (existingInvite.length > 0 && existingInvite[0].status === "pending") {
      throw new Error("This email has already been invited");
    }

    // Delete old invite if exists
    if (existingInvite.length > 0) {
      await sql`
        DELETE FROM workspace_invite
        WHERE workspace_id = ${workspaceId} AND LOWER(invited_email) = ${normalizedEmail}
      `;
    }

    // Create new invite
    await sql`
      INSERT INTO workspace_invite (workspace_id, invited_email, invited_by_user_id, role)
      VALUES (${workspaceId}, ${normalizedEmail}, ${userId}, ${role})
    `;

    // TODO: Send invite email

    return { type: "invite", email: normalizedEmail };
  }
}

/**
 * Remove a member from workspace. Owner only (except self-removal).
 */
export async function removeWorkspaceMember(data: {
  workspaceId: number;
  targetUserId: string;
}): Promise<void> {
  const userId = await getUserId();

  const { workspaceId, targetUserId } = data;

  // Get caller's role
  const callerRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (callerRole.length === 0) {
    throw new Error("Workspace not found or you are not a member");
  }

  // Self-removal is always allowed (except for last owner)
  if (userId === targetUserId) {
    // Check if last owner
    const ownerCount = await sql`
      SELECT COUNT(*) as count FROM workspace_member
      WHERE workspace_id = ${workspaceId} AND role = 'owner'
    `;

    if (
      callerRole[0].role === "owner" &&
      Number(ownerCount[0].count) <= 1
    ) {
      throw new Error(
        "Cannot leave workspace - you are the only owner. Transfer ownership first."
      );
    }

    await sql`
      DELETE FROM workspace_member
      WHERE workspace_id = ${workspaceId} AND user_id = ${targetUserId}
    `;
    return;
  }

  // Only owners can remove other members
  if (callerRole[0].role !== "owner") {
    throw new Error("Only workspace owners can remove other members");
  }

  // Cannot remove another owner
  const targetRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${targetUserId}
  `;

  if (targetRole.length === 0) {
    throw new Error("Member not found");
  }

  if (targetRole[0].role === "owner") {
    throw new Error("Cannot remove another owner");
  }

  await sql`
    DELETE FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${targetUserId}
  `;
}

/**
 * Update a member's role. Owner only.
 */
export async function updateMemberRole(data: {
  workspaceId: number;
  targetUserId: string;
  newRole: WorkspaceRoleValue;
}): Promise<void> {
  const userId = await getUserId();

  const { workspaceId, targetUserId, newRole } = data;

  // Verify caller is owner
  const callerRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (callerRole.length === 0 || callerRole[0].role !== "owner") {
    throw new Error("Only workspace owners can change member roles");
  }

  // Cannot change own role
  if (userId === targetUserId) {
    throw new Error("Cannot change your own role");
  }

  // Verify target exists
  const targetMember = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${targetUserId}
  `;

  if (targetMember.length === 0) {
    throw new Error("Member not found");
  }

  await sql`
    UPDATE workspace_member
    SET role = ${newRole}
    WHERE workspace_id = ${workspaceId} AND user_id = ${targetUserId}
  `;
}

/**
 * Accept a workspace invite by token.
 */
export async function acceptWorkspaceInvite(
  token: string
): Promise<{ workspaceId: number }> {
  const userId = await getUserId();

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
    SELECT invite_id, workspace_id, invited_email, role, status
    FROM workspace_invite
    WHERE invite_token = ${token}
  `;

  if (inviteResult.length === 0) {
    throw new Error("Invite not found or expired");
  }

  const invite = inviteResult[0];

  if (invite.status !== "pending") {
    throw new Error("This invite has already been used");
  }

  // Verify email matches
  if (invite.invited_email?.toLowerCase() !== userEmail) {
    throw new Error("This invite was sent to a different email address");
  }

  // Check if already a member
  const existingMember = await sql`
    SELECT member_id FROM workspace_member
    WHERE workspace_id = ${invite.workspace_id} AND user_id = ${userId}
  `;

  if (existingMember.length > 0) {
    // Already a member, just mark invite as accepted
    await sql`
      UPDATE workspace_invite
      SET status = 'accepted'
      WHERE invite_id = ${invite.invite_id}
    `;
    return { workspaceId: Number(invite.workspace_id) };
  }

  // Add as member
  await sql`
    INSERT INTO workspace_member (workspace_id, user_id, role)
    VALUES (${invite.workspace_id}, ${userId}, ${invite.role})
  `;

  // Mark invite as accepted
  await sql`
    UPDATE workspace_invite
    SET status = 'accepted'
    WHERE invite_id = ${invite.invite_id}
  `;

  return { workspaceId: Number(invite.workspace_id) };
}

/**
 * Get pending invites for a workspace. Owner/Editor only.
 */
export async function getWorkspaceInvites(
  workspaceId: number
): Promise<WorkspaceInvite[]> {
  const userId = await getUserId();

  // Verify caller has permission
  const callerRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (
    callerRole.length === 0 ||
    !["owner", "editor"].includes(callerRole[0].role)
  ) {
    throw new Error("Access denied");
  }

  const invites = await sql`
    SELECT * FROM workspace_invite
    WHERE workspace_id = ${workspaceId} AND status = 'pending'
    ORDER BY created_at DESC
  `;

  return invites.map((i) => ({
    invite_id: Number(i.invite_id),
    workspace_id: Number(i.workspace_id),
    invited_email: String(i.invited_email),
    invited_by_user_id: String(i.invited_by_user_id),
    invite_token: String(i.invite_token),
    role: String(i.role) as WorkspaceRoleValue,
    status: String(i.status) as "pending" | "accepted" | "expired",
    created_at: String(i.created_at),
  }));
}

/**
 * Cancel a pending invite. Owner/Editor only.
 */
export async function cancelWorkspaceInvite(inviteId: number): Promise<void> {
  const userId = await getUserId();

  // Get invite and workspace
  const inviteResult = await sql`
    SELECT workspace_id FROM workspace_invite
    WHERE invite_id = ${inviteId} AND status = 'pending'
  `;

  if (inviteResult.length === 0) {
    throw new Error("Invite not found or already processed");
  }

  const workspaceId = inviteResult[0].workspace_id;

  // Verify caller has permission
  const callerRole = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (
    callerRole.length === 0 ||
    !["owner", "editor"].includes(callerRole[0].role)
  ) {
    throw new Error("Access denied");
  }

  await sql`
    DELETE FROM workspace_invite WHERE invite_id = ${inviteId}
  `;
}

/**
 * Convert pending workspace invites when a new user signs up.
 * Called from Clerk webhook on user.created
 */
export async function convertPendingWorkspaceInvites(
  userEmail: string,
  newUserId: string
): Promise<{ converted: number }> {
  const normalizedEmail = userEmail.toLowerCase();

  const pendingInvites = await sql`
    SELECT invite_id, workspace_id, role
    FROM workspace_invite
    WHERE LOWER(invited_email) = ${normalizedEmail} AND status = 'pending'
  `;

  if (pendingInvites.length === 0) {
    return { converted: 0 };
  }

  let converted = 0;

  for (const invite of pendingInvites) {
    try {
      // Add as member
      await sql`
        INSERT INTO workspace_member (workspace_id, user_id, role)
        VALUES (${invite.workspace_id}, ${newUserId}, ${invite.role})
        ON CONFLICT (workspace_id, user_id) DO NOTHING
      `;

      // Mark invite as accepted
      await sql`
        UPDATE workspace_invite
        SET status = 'accepted'
        WHERE invite_id = ${invite.invite_id}
      `;

      converted++;
    } catch (error) {
      console.error(
        `[convertPendingWorkspaceInvites] Failed to convert invite ${invite.invite_id}:`,
        error
      );
    }
  }

  console.log(
    `[convertPendingWorkspaceInvites] Converted ${converted} workspace invites for ${normalizedEmail}`
  );
  return { converted };
}

// ===========================================
// FLAVOUR LINKING
// ===========================================

/**
 * Get all flavours linked to a workspace.
 */
export async function getWorkspaceFlavours(
  workspaceId: number
): Promise<(WorkspaceFlavour & { flavour: Flavour })[]> {
  const userId = await getUserId();

  // Verify membership
  const membership = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (membership.length === 0) {
    throw new Error("Workspace not found or you are not a member");
  }

  const flavours = await sql`
    SELECT
      wf.*,
      f.flavour_id,
      f.name,
      f.description,
      f.is_public,
      f.user_id,
      f.category_id,
      f.status,
      f.version,
      f.base_unit,
      f.flavor_profile,
      f.created_at as flavour_created_at,
      f.updated_at as flavour_updated_at,
      u.username as added_by_username
    FROM workspace_flavour wf
    JOIN flavour f ON wf.flavour_id = f.flavour_id
    LEFT JOIN users u ON wf.added_by = u.user_id
    WHERE wf.workspace_id = ${workspaceId}
    ORDER BY wf.added_at DESC
  `;

  return flavours.map((row) => ({
    workspace_id: Number(row.workspace_id),
    flavour_id: Number(row.flavour_id),
    added_by: row.added_by ? String(row.added_by) : null,
    added_at: String(row.added_at),
    flavour: {
      flavour_id: Number(row.flavour_id),
      name: String(row.name),
      description: row.description ? String(row.description) : null,
      is_public: Boolean(row.is_public),
      user_id: row.user_id ? String(row.user_id) : null,
      category_id: row.category_id ? Number(row.category_id) : null,
      status: String(row.status) as Flavour["status"],
      version: Number(row.version),
      base_unit: String(row.base_unit) as Flavour["base_unit"],
      flavor_profile: row.flavor_profile,
      created_at: String(row.flavour_created_at),
      updated_at: String(row.flavour_updated_at),
    },
  }));
}

/**
 * Link a flavour to a workspace. User must own the flavour.
 */
export async function linkFlavourToWorkspace(data: {
  flavourId: number;
  workspaceId: number;
}): Promise<void> {
  const userId = await getUserId();

  const { flavourId, workspaceId } = data;

  // Verify user owns the flavour
  const flavourCheck = await sql`
    SELECT flavour_id FROM flavour
    WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or you don't own it");
  }

  // Verify user is workspace member with edit permission
  const memberCheck = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (memberCheck.length === 0) {
    throw new Error("Workspace not found or you are not a member");
  }

  if (memberCheck[0].role === "viewer") {
    throw new Error("Viewers cannot link flavours to workspaces");
  }

  // Check if already linked
  const existingLink = await sql`
    SELECT workspace_id FROM workspace_flavour
    WHERE workspace_id = ${workspaceId} AND flavour_id = ${flavourId}
  `;

  if (existingLink.length > 0) {
    throw new Error("Flavour is already linked to this workspace");
  }

  await sql`
    INSERT INTO workspace_flavour (workspace_id, flavour_id, added_by)
    VALUES (${workspaceId}, ${flavourId}, ${userId})
  `;
}

/**
 * Unlink a flavour from a workspace. Editor/Owner only.
 */
export async function unlinkFlavourFromWorkspace(data: {
  flavourId: number;
  workspaceId: number;
}): Promise<void> {
  const userId = await getUserId();

  const { flavourId, workspaceId } = data;

  // Verify user is workspace member with edit permission
  const memberCheck = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (memberCheck.length === 0) {
    throw new Error("Workspace not found or you are not a member");
  }

  if (memberCheck[0].role === "viewer") {
    throw new Error("Viewers cannot unlink flavours from workspaces");
  }

  await sql`
    DELETE FROM workspace_flavour
    WHERE workspace_id = ${workspaceId} AND flavour_id = ${flavourId}
  `;
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Check if user has access to a workspace and return their role.
 */
export async function getUserWorkspaceRole(
  workspaceId: number
): Promise<WorkspaceRoleValue | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const result = await sql`
    SELECT role FROM workspace_member
    WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
  `;

  if (result.length === 0) return null;
  return result[0].role as WorkspaceRoleValue;
}

/**
 * Check if user can edit in a workspace (owner or editor).
 */
export async function canEditInWorkspace(
  workspaceId: number
): Promise<boolean> {
  const role = await getUserWorkspaceRole(workspaceId);
  return role === "owner" || role === "editor";
}
