"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import {
  type FlavourStatusValue,
  isValidFlavourStatus,
} from "@/constants";
import { createFlavourSchema, updateFlavourSchema } from "@/lib/validations/flavour";

export type FlavourAccessSource = "own" | "shared" | "workspace";

export type FlavourWithAccess = {
  flavour_id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string | null;
  category_id: number | null;
  status: string;
  version: number;
  base_unit: string;
  flavor_profile: Record<string, number> | null;
  created_at: string;
  updated_at: string;
  // Access info
  access_source: FlavourAccessSource;
  shared_by_username?: string | null;
  shared_by_email?: string | null;
  workspace_name?: string | null;
  workspace_id?: number | null;
  can_edit: boolean;
};

export async function getFlavours(): Promise<FlavourWithAccess[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get all flavours user has access to: owned, shared, or via workspace
  const result = await sql`
    SELECT DISTINCT ON (f.flavour_id)
      f.*,
      CASE
        WHEN f.user_id = ${userId} THEN 'own'
        WHEN fs.share_id IS NOT NULL THEN 'shared'
        WHEN wm.member_id IS NOT NULL THEN 'workspace'
      END as access_source,
      sharer.username as shared_by_username,
      sharer.email as shared_by_email,
      w.name as workspace_name,
      w.workspace_id as access_workspace_id,
      CASE
        WHEN f.user_id = ${userId} THEN true
        WHEN wm.role IN ('owner', 'editor') THEN true
        ELSE false
      END as can_edit
    FROM flavour f
    LEFT JOIN flavour_shares fs ON f.flavour_id = fs.flavour_id
      AND fs.shared_with_user_id = ${userId}
    LEFT JOIN users sharer ON fs.shared_by_user_id = sharer.user_id
    LEFT JOIN workspace_flavour wf ON f.flavour_id = wf.flavour_id
    LEFT JOIN workspace_member wm ON wf.workspace_id = wm.workspace_id
      AND wm.user_id = ${userId}
    LEFT JOIN workspace w ON wf.workspace_id = w.workspace_id
    WHERE f.user_id = ${userId}
      OR fs.share_id IS NOT NULL
      OR wm.member_id IS NOT NULL
    ORDER BY f.flavour_id,
      CASE
        WHEN f.user_id = ${userId} THEN 1
        WHEN wm.member_id IS NOT NULL THEN 2
        ELSE 3
      END
  `;

  return result.map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    is_public: Boolean(f.is_public),
    user_id: f.user_id ? String(f.user_id) : null,
    category_id: f.category_id ? Number(f.category_id) : null,
    status: String(f.status),
    version: Number(f.version),
    base_unit: String(f.base_unit),
    flavor_profile: f.flavor_profile as Record<string, number> | null,
    created_at: String(f.created_at),
    updated_at: String(f.updated_at),
    access_source: String(f.access_source) as FlavourAccessSource,
    shared_by_username: f.shared_by_username ? String(f.shared_by_username) : null,
    shared_by_email: f.shared_by_email ? String(f.shared_by_email) : null,
    workspace_name: f.workspace_name ? String(f.workspace_name) : null,
    workspace_id: f.access_workspace_id ? Number(f.access_workspace_id) : null,
    can_edit: Boolean(f.can_edit),
  }));
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

  // Get substances with junction table data (concentration, unit, supplier, dilution, price_per_kg)
  const substances = await sql`
    SELECT
      s.*,
      sf.concentration,
      sf.unit,
      sf.order_index,
      sf.supplier,
      sf.dilution,
      sf.price_per_kg
    FROM substance_flavour sf
    JOIN substance s ON sf.substance_id = s.substance_id
    WHERE sf.flavour_id = ${flavourId}
    ORDER BY sf.order_index
  `;

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

// Default zeroed flavor profile for new flavours
const DEFAULT_FLAVOR_PROFILE = [
  { attribute: "Sweetness", value: 0 },
  { attribute: "Sourness", value: 0 },
  { attribute: "Bitterness", value: 0 },
  { attribute: "Umami", value: 0 },
  { attribute: "Saltiness", value: 0 },
];

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
    supplier?: string | null;
    dilution?: string | null;
    price_per_kg?: number | null;
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

  // Insert flavour with default zeroed flavor profile
  const flavourResult = await sql`
    INSERT INTO flavour (name, description, is_public, category_id, status, base_unit, user_id, flavor_profile)
    VALUES (${name}, ${description ?? null}, ${is_public}, ${category_id}, ${status}, ${base_unit}, ${userId}, ${JSON.stringify(DEFAULT_FLAVOR_PROFILE)}::jsonb)
    RETURNING *
  `;

  const newFlavour = flavourResult[0];
  const insertedSubstances: Record<string, unknown>[] = [];

  // Insert substances if provided
  for (const sub of substances) {
    const { fema_number, concentration, unit, order_index, supplier, dilution, price_per_kg } = sub;

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
      INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index, supplier, dilution, price_per_kg)
      VALUES (${substanceId}, ${newFlavour.flavour_id}, ${concentration}, ${unit}, ${order_index}, ${supplier ?? null}, ${dilution ?? null}, ${price_per_kg ?? null})
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
    concentration?: number | null;
    unit?: string | null;
    order_index: number;
    supplier?: string | null;
    dilution?: string | null;
    price_per_kg?: number | null;
  }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { fema_number, concentration, unit, order_index, supplier, dilution, price_per_kg } = data;

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
    INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index, supplier, dilution, price_per_kg)
    VALUES (${substanceId}, ${flavourId}, ${concentration ?? null}, ${unit || null}, ${order_index}, ${supplier ?? null}, ${dilution ?? null}, ${price_per_kg ?? null})
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
      INSERT INTO public.substance_flavour (substance_id, flavour_id, concentration, unit, order_index, supplier, dilution, price_per_kg)
      VALUES (${sub.substance_id}, ${newFlavour.flavour_id}, ${sub.concentration}, ${sub.unit}, ${sub.order_index}, ${sub.supplier}, ${sub.dilution}, ${sub.price_per_kg})
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
