"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import {
  type FlavourStatusValue,
  isValidFlavourStatus,
} from "@/constants";
import { createFlavourSchema, updateFlavourSchema } from "@/lib/validations/flavour";

export async function getFlavours() {
  const { userId } = await auth();
  console.log("[DEBUG getFlavours] userId from auth:", userId);
  if (!userId) throw new Error("Unauthorized");

  const result = await sql`SELECT * FROM flavour WHERE user_id = ${userId}`;
  console.log("[DEBUG getFlavours] Found", result.length, "flavours for user", userId);
  return result;
}

export async function getFlavourById(flavourId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if user is owner OR has shared access OR has workspace access
  const accessCheck = await sql`
    SELECT
      f.*,
      CASE WHEN f.user_id = ${userId} THEN true ELSE false END as is_owner,
      CASE WHEN fs.share_id IS NOT NULL THEN true ELSE false END as is_shared_with_me,
      sharer.username as shared_by_username,
      sharer.email as shared_by_email,
      CASE WHEN wm.member_id IS NOT NULL THEN true ELSE false END as has_workspace_access,
      wm.role as workspace_role,
      w.name as workspace_name,
      w.workspace_id as access_workspace_id
    FROM flavour f
    LEFT JOIN flavour_shares fs ON f.flavour_id = fs.flavour_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN users sharer ON fs.shared_by_user_id = sharer.user_id
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    LEFT JOIN workspace w ON wf.workspace_id = w.workspace_id
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (accessCheck.length === 0) {
    throw new Error("Forbidden: You do not have access to this flavour");
  }

  const flavourData = accessCheck[0];
  const isOwner = Boolean(flavourData.is_owner);
  const isSharedWithMe = Boolean(flavourData.is_shared_with_me);
  const hasWorkspaceAccess = Boolean(flavourData.has_workspace_access);
  const workspaceRole = flavourData.workspace_role as string | null;
  const canEditViaWorkspace = hasWorkspaceAccess && (workspaceRole === "owner" || workspaceRole === "editor");

  // Extract flavour fields (without the computed fields)
  const {
    is_owner,
    is_shared_with_me,
    shared_by_username,
    shared_by_email,
    has_workspace_access,
    workspace_role,
    workspace_name,
    access_workspace_id,
    ...flavour
  } = flavourData;

  const substanceLinks = await sql`
    SELECT substance_id FROM substance_flavour WHERE flavour_id = ${flavourId}
  `;

  const substanceIds = substanceLinks.map(
    (row) => (row as { substance_id: number }).substance_id
  );

  let substances: Record<string, unknown>[] = [];
  if (substanceIds.length > 0) {
    substances = await sql`
      SELECT * FROM substance WHERE substance_id = ANY(${substanceIds}::int[])
    `;
  }

  return {
    flavour,
    substances,
    isOwner,
    isSharedWithMe,
    sharedBy: isSharedWithMe ? {
      username: shared_by_username,
      email: shared_by_email,
    } : null,
    hasWorkspaceAccess,
    canEditViaWorkspace,
    workspace: hasWorkspaceAccess ? {
      workspace_id: access_workspace_id,
      name: workspace_name,
      role: workspaceRole,
    } : null,
  };
}

export async function createFlavour(data: {
  name: string;
  description?: string;
  is_public?: boolean;
  category_id?: number | null;
  status?: string;
  base_unit?: string;
  substances?: Array<{
    fema_number: number;
    concentration: number;
    unit: string;
    order_index: number;
  }>;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate with Zod
  const validation = createFlavourSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid flavour data");
  }

  const {
    name,
    description,
    is_public,
    category_id,
    status,
    base_unit,
    substances,
  } = validation.data;

  // Insert flavour
  const flavourResult = await sql`
    INSERT INTO flavour (name, description, is_public, category_id, status, base_unit, user_id)
    VALUES (${name}, ${description ?? null}, ${is_public}, ${category_id}, ${status}, ${base_unit}, ${userId})
    RETURNING *
  `;

  const newFlavour = flavourResult[0];
  const insertedSubstances: Record<string, unknown>[] = [];

  // Insert substances if provided
  for (const sub of substances) {
    const { fema_number, concentration, unit, order_index } = sub;

    // Find substance_id by fema_number
    const substanceCheck = await sql`
      SELECT substance_id FROM public.substance WHERE fema_number = ${fema_number}
    `;

    if (substanceCheck.length === 0) {
      throw new Error(`Substance with FEMA number ${fema_number} not found.`);
    }

    const substanceId = substanceCheck[0].substance_id;

    // Insert into substance_flavour
    const result = await sql`
      INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index)
      VALUES (${substanceId}, ${newFlavour.flavour_id}, ${concentration}, ${unit}, ${order_index})
      RETURNING *
    `;

    insertedSubstances.push(result[0]);
  }

  return { flavour: newFlavour, substances: insertedSubstances };
}

export async function addSubstanceToFlavour(
  flavourId: number,
  data: {
    fema_number: number;
    concentration: number;
    unit: string;
    order_index: number;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { fema_number, concentration, unit, order_index } = data;

  // Check substance exists
  const substanceCheck = await sql`
    SELECT substance_id FROM public.substance WHERE fema_number = ${fema_number}
  `;

  if (substanceCheck.length === 0) {
    throw new Error("Substance not found");
  }

  const substanceId = substanceCheck[0].substance_id;

  // Check flavour exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const result = await sql`
    INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index)
    VALUES (${substanceId}, ${flavourId}, ${concentration}, ${unit}, ${order_index})
    RETURNING *
  `;

  return result[0];
}

export async function removeSubstanceFromFlavour(
  flavourId: number,
  substanceId: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check flavour exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const checkRelation = await sql`
    SELECT * FROM public.substance_flavour
    WHERE substance_id = ${substanceId} AND flavour_id = ${flavourId}
  `;

  if (checkRelation.length === 0) {
    throw new Error(
      `Substance with ID ${substanceId} not found in flavour with ID ${flavourId}`
    );
  }

  await sql`
    DELETE FROM public.substance_flavour
    WHERE substance_id = ${substanceId} AND flavour_id = ${flavourId}
  `;

  return { success: true };
}

export async function updateFlavourStatus(
  flavourId: number,
  status: FlavourStatusValue
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate status
  if (!isValidFlavourStatus(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // Check flavour exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const result = await sql`
    UPDATE public.flavour
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
    RETURNING *
  `;

  return result[0];
}

export async function updateFlavour(
  flavourId: number,
  data: {
    name?: string;
    description?: string;
    is_public?: boolean;
    category_id?: number | null;
    status?: string;
    base_unit?: string;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate with Zod
  const validation = updateFlavourSchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid flavour data");
  }

  const validatedData = validation.data;

  // Check flavour exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT
      f.*,
      CASE WHEN f.user_id = ${userId} THEN true ELSE false END as is_owner,
      wm.role as workspace_role
    FROM public.flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const existing = accessCheck[0];

  // Merge validated data with existing values
  // undefined = keep existing, null = clear, value = update
  const finalData = {
    name: validatedData.name ?? existing.name,
    description: validatedData.description !== undefined ? validatedData.description : existing.description,
    is_public: validatedData.is_public ?? existing.is_public,
    category_id: validatedData.category_id !== undefined ? validatedData.category_id : existing.category_id,
    status: validatedData.status ?? existing.status,
    base_unit: validatedData.base_unit ?? existing.base_unit,
  };

  const result = await sql`
    UPDATE public.flavour
    SET
      name = ${finalData.name},
      description = ${finalData.description},
      is_public = ${finalData.is_public},
      category_id = ${finalData.category_id},
      status = ${finalData.status},
      base_unit = ${finalData.base_unit},
      updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
    RETURNING *
  `;

  return result[0];
}

export async function duplicateFlavour(flavourId: number, newName?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get original flavour - check if user owns it, has shared access, OR has workspace access
  const originalFlavour = await sql`
    SELECT f.*
    FROM public.flavour f
    LEFT JOIN flavour_shares fs ON f.flavour_id = fs.flavour_id AND fs.shared_with_user_id = ${userId}
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR fs.share_id IS NOT NULL OR wm.member_id IS NOT NULL)
  `;

  if (originalFlavour.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const original = originalFlavour[0];
  const duplicateName = newName || `${original.name} (Copy)`;

  // Create new flavour
  const newFlavourResult = await sql`
    INSERT INTO public.flavour (name, description, is_public, category_id, status, base_unit, user_id)
    VALUES (${duplicateName}, ${original.description}, false, ${original.category_id}, 'draft', ${original.base_unit}, ${userId})
    RETURNING *
  `;

  const newFlavour = newFlavourResult[0];

  // Copy substances
  const originalSubstances = await sql`
    SELECT * FROM public.substance_flavour WHERE flavour_id = ${flavourId}
  `;

  for (const sub of originalSubstances) {
    await sql`
      INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index)
      VALUES (${sub.substance_id}, ${newFlavour.flavour_id}, ${sub.concentration}, ${sub.unit}, ${sub.order_index})
    `;
  }

  return newFlavour;
}

export async function deleteFlavour(flavourId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check flavour exists and belongs to user
  const flavourCheck = await sql`
    SELECT * FROM public.flavour WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  // Delete substance links first
  await sql`DELETE FROM public.substance_flavour WHERE flavour_id = ${flavourId}`;

  // Delete flavour
  await sql`DELETE FROM public.flavour WHERE flavour_id = ${flavourId} AND user_id = ${userId}`;

  return { success: true };
}

export async function updateFlavorProfile(
  flavourId: number,
  flavorProfile: Array<{ attribute: string; value: number }>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Validate the flavor profile structure
  if (!Array.isArray(flavorProfile)) {
    throw new Error("Flavor profile must be an array");
  }

  for (const item of flavorProfile) {
    if (typeof item.attribute !== "string" || item.attribute.trim() === "") {
      throw new Error("Each attribute must have a non-empty name");
    }
    if (typeof item.value !== "number" || item.value < 0 || item.value > 100) {
      throw new Error("Each value must be a number between 0 and 100");
    }
  }

  // Check flavour exists and user has edit access (owner OR workspace editor/owner)
  const accessCheck = await sql`
    SELECT f.*
    FROM public.flavour f
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    WHERE f.flavour_id = ${flavourId}
      AND (f.user_id = ${userId} OR wm.role IN ('owner', 'editor'))
  `;

  if (accessCheck.length === 0) {
    throw new Error("Flavour not found or access denied");
  }

  const result = await sql`
    UPDATE public.flavour
    SET flavor_profile = ${JSON.stringify(flavorProfile)}::jsonb, updated_at = CURRENT_TIMESTAMP
    WHERE flavour_id = ${flavourId}
    RETURNING *
  `;

  return result[0];
}
