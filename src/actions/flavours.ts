"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

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

  const flavourResult = await sql`
    SELECT * FROM flavour WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourResult.length === 0) {
    throw new Error("Forbidden: You do not have access to this flavour");
  }

  const flavour = flavourResult[0];

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

  return { flavour, substances };
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

  const {
    name,
    description,
    is_public = false,
    category_id = null,
    status = "draft",
    base_unit = "",
    substances = [],
  } = data;

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

  // Check flavour exists and belongs to user
  const flavourCheck = await sql`
    SELECT * FROM public.flavour WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
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

  // Check flavour belongs to user
  const flavourCheck = await sql`
    SELECT * FROM public.flavour WHERE flavour_id = ${flavourId} AND user_id = ${userId}
  `;

  if (flavourCheck.length === 0) {
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
